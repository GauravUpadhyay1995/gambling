import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Team } from '@/models/Team';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { ApiError } from '@/lib/errorHandler';
import { verifyAdmin } from '@/lib/verifyAdmin';

type UpdateTeamBody = {
  name?: string;
  designation?: string;
  department?: string;
  profileImage?: string;
  description?: string;
  isSteering?: boolean;
  showingOrder?: number | null;
  socialLinks?: Record<string, string>;
  updatedBy?: string;
  isActive?: boolean;
};

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();
    const user = (req as any).user;
    const teamId = params.id;

    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());

    // ✅ Parse socialLinks (optional)
    let parsedSocialLinks: Record<string, string> = {};
    if (typeof body.socialLinks === 'string') {
      try {
        parsedSocialLinks = JSON.parse(body.socialLinks);
      } catch {
        parsedSocialLinks = {};
      }
    }

    // ✅ Check if team exists
    const existingTeam = await Team.findById(teamId);
    if (!existingTeam) {
      return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
    }

    // ✅ Handle profile image upload (optional)
    const file = formData.get('profileImage') as File | null;
    let profileImage = existingTeam.profileImage;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadBufferToS3(buffer, file.type, file.name, 'teams');
      profileImage = result?.url || profileImage;
    }

    // ✅ Toggle isActive if explicitly provided
    let isActive: boolean | undefined;
    if (body.hasOwnProperty('isActive')) {
      const input = body.isActive?.toString().toLowerCase();
      isActive = input === 'true' ? true : input === 'false' ? false : !existingTeam.isActive;
    }

    // ✅ Convert isSteering string to boolean
    let isSteering: boolean | undefined;
    if (body.hasOwnProperty('isSteering')) {
      const input = body.isSteering?.toString().toLowerCase();
      isSteering = input === 'true';
    }

    // ✅ Build update object
    const updateData: UpdateTeamBody = {
      ...(body.name && { name: body.name }),
      ...(body.designation && { designation: body.designation }),
      ...(body.department && { department: body.department }),
      ...(body.description && { description: body.description }),
      ...(isSteering !== undefined && { isSteering }),
      ...(body.showingOrder !== undefined && { showingOrder: body.showingOrder }),
      ...(profileImage && { profileImage }),
      ...(parsedSocialLinks && Object.keys(parsedSocialLinks).length && { socialLinks: parsedSocialLinks }),
      ...(isActive !== undefined && { isActive }),
      updatedBy: user.id,
    };

    // ✅ Perform update
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTeam) throw new ApiError(404, 'Team not found after update');

    return NextResponse.json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam,
    });
  })
);
