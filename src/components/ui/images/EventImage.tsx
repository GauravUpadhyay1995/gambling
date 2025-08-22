'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface ImageGalleryProps {
  existingImages: { url: string; id: string }[];
  setExistingImages: (files: { url: string; id: string }[]) => void;
  onDeleteImage: (fileId: string) => Promise<void>;
}

export default function ImageGallery({
  existingImages,
  setExistingImages,
  onDeleteImage,
}: ImageGalleryProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    if (previewIndex === null || existingImages.length <= 1) return;

    const interval = setInterval(() => {
      setPreviewIndex((prev) =>
        prev !== null ? (prev + 1) % existingImages.length : 0
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [previewIndex, existingImages.length]);

  const handleDelete = async (fileId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed) return;

    try {
      await onDeleteImage(fileId);
      // Remove the deleted image from local state
      const updatedImages = existingImages.filter((f) => f.id !== fileId);
      setExistingImages(updatedImages);
      
      // Reset preview if the deleted image was being previewed
      if (previewIndex !== null) {
        if (existingImages[previewIndex]?.id === fileId) {
          setPreviewIndex(null);
        } else if (previewIndex >= updatedImages.length) {
          // Adjust preview index if it's now out of bounds
          setPreviewIndex(updatedImages.length - 1);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete file');
    }
  };

  const handleThumbnailClick = (index: number) => {
    setPreviewIndex(index);
  };

  return (
    <>
      {/* Thumbnail Preview */}
      <div className="flex flex-wrap gap-3">
        {existingImages.map((img, idx) => (
          <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden group">
            <Image
              src={img.url}
              alt={`Image ${idx + 1}`}
              fill
              className="object-cover rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer"
              onClick={() => handleThumbnailClick(idx)}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(img.id);
              }}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Fullscreen Preview */}
      {previewIndex !== null && existingImages[previewIndex] && (
        <div
          onClick={() => setPreviewIndex(null)}
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
        >
          <div
            className="relative w-[80vw] h-[70vh] max-w-2xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={existingImages[previewIndex].url}
              alt={`Preview ${previewIndex + 1}`}
              fill
              className="object-contain rounded-lg"
              priority
            />

            <div className="absolute top-0 left-0 right-0 flex justify-between p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(existingImages[previewIndex].id);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded shadow"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(null);
                }}
                className="bg-white hover:bg-gray-100 text-black text-xs px-2 py-1 rounded shadow"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}