import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Gallery } from '@/models/Gallery';
import { Types } from 'mongoose';

export const PATCH = withAuth(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string, videoId: string } }) => {
        await connectToDB();
        const { id: galleryId, videoId } = params;

        if (!Types.ObjectId.isValid(galleryId) || !Types.ObjectId.isValid(videoId)) {
            return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
        }

        const body = await req.json(); // expecting { url: "https://..." }
        if (!body?.video_url || typeof body.video_url !== 'string') {
            return NextResponse.json({ success: false, message: 'New video URL is required' }, { status: 400 });
        }

        const gallery = await Gallery.findById(galleryId);
        if (!gallery) {
            return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
        }

        const index = gallery.video_url.findIndex((v: any) => v._id.toString() === videoId);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Video not found in gallery' }, { status: 404 });
        }

        // Update the video url
        gallery.video_url[index].url = body.video_url;
        gallery.updatedBy = (req as any).user.id;
        await gallery.save();

        return NextResponse.json({
            success: true,
            message: 'Video URL updated successfully',
            data: gallery.toObject(),
        });
    })
);

export const DELETE = withAuth(
    asyncHandler(async (req: NextRequest, { params }: { params: { id: string, videoId: string } }) => {
        await connectToDB();
        const { id: galleryId, videoId } = params;

        if (!Types.ObjectId.isValid(galleryId) || !Types.ObjectId.isValid(videoId)) {
            return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
        }

        const gallery = await Gallery.findById(galleryId);
        if (!gallery) {
            return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
        }

        const index = gallery.video_url.findIndex((v: any) => v._id.toString() === videoId);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Video not found in gallery' }, { status: 404 });
        }

        gallery.video_url.splice(index, 1); // Remove video from array
        gallery.updatedBy = (req as any).user.id;
        await gallery.save();

        return NextResponse.json({
            success: true,
            message: 'Video deleted successfully',
            data: gallery.toObject(),
        });
    })
);
