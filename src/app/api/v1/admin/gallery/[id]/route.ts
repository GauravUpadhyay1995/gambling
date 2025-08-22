import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Gallery } from '@/models/Gallery';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';

export const GET =  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const galleryId = params?.id;

    // Fetch gallery with populated user references and lean projection
    const gallery = await Gallery.findById(galleryId)
      // .populate('createdBy', 'name ') // Only include name and email of creator
      // .populate('updatedBy', 'name ') // Only include name and email of updater
      .lean() // Convert to plain JS object
      .select('-__v') // Exclude version key and updatedAt
      .exec();

    if (!gallery) {
      return NextResponse.json(
        { success: false, message: 'Gallery not found' },
        { status: 404 }
      );
    }

    // Transform the response to flatten user objects
    const transformedGallery = {
      ...gallery,
      createdBy: gallery.createdBy ? {
        id: gallery.createdBy._id,
        name: gallery.createdBy.name,
      
      } : null,
      updatedBy: gallery.updatedBy ? {
        id: gallery.updatedBy._id,
        name: gallery.updatedBy.name,
      
      } : null
    };

    return NextResponse.json(
      { 
        success: true, 
        message: 'Gallery fetched successfully', 
        data: transformedGallery 
      }
    );
  })