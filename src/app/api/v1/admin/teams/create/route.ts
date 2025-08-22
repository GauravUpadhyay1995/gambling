import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { Team } from '@/models/Team';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { createTeamSchema } from '@/lib/validations/team.schema';
import { Types } from 'mongoose';
import { verifyAdmin } from '@/lib/verifyAdmin';

type CreateTeamBody = {
  name: string;
  profileImage: string;
  designation?: string;
  department?: string;
  description?: string;
  socialLinks?: Record<string, string>;
  showingOrder?: number | null;
  isActive?: boolean;
  isSteering?: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
};

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const user = (req as any).user;
    const formData = await req.formData();

    const rawBody = Object.fromEntries(formData.entries());

    // ✅ Parse socialLinks if it exists as a stringified JSON
    let parsedSocialLinks: Record<string, string> = {};
    if (typeof rawBody.socialLinks === 'string') {
      try {
        parsedSocialLinks = JSON.parse(rawBody.socialLinks);
      } catch {
        parsedSocialLinks = {};
      }
    }
    rawBody.socialLinks = parsedSocialLinks;

    // ⚠ Remove profileImage before Joi validation
    delete rawBody.profileImage;

    // ✅ Validate request body
    const { error, value } = createTeamSchema.validate(rawBody, { abortEarly: false });
    if (error) {
      const formattedErrors = error.details.reduce((acc, curr) => {
        acc[curr.path[0] as string] = curr.message;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
          data: null,
        },
        { status: 400 }
      );
    }

    // ✅ Handle file upload (required)
    const file = formData.get('profileImage') as File | null;
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'Profile image is required',
          errors: { profileImage: 'Profile image file is required' },
          data: null,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadBufferToS3(buffer, file.type, file.name, 'teams');
    const profileImageUrl = upload?.url;

    if (!profileImageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to upload profile image',
          data: null,
        },
        { status: 500 }
      );
    }

    // ✅ Build team data
    const teamData: CreateTeamBody = {
      ...value,
      profileImage: profileImageUrl,
      createdBy: new Types.ObjectId(user.id),
      updatedBy: new Types.ObjectId(user.id),
    };

    // ✅ Save to DB
    const created = await createTeam(teamData);

    return NextResponse.json({
      success: true,
      message: 'Team created successfully',
      data: created,
    });
  })
);

// 🔁 Helper function
const createTeam = async (data: CreateTeamBody) => {
  try {
    await connectToDB();
    const team = new Team(data);
    const saved = await team.save();
    return saved.toObject();
  } catch (err) {
    console.error('Team creation failed:', err);
    throw new Error('Team creation failed');
  }
};
