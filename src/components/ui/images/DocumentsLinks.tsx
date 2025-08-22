'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt } from 'react-icons/fa';

interface FileGalleryProps {
  existingFiles: { url: string; id: string }[]; // array of objects with url and id
  setExistingFiles: (files: { url: string; id: string }[]) => void;
  onDeleteFile: (fileId: string) => Promise<void>;
}

function getFileType(url: string | undefined): string {
  if (!url || typeof url !== 'string') return 'other';

  try {
    const ext = url.split('.').pop()?.toLowerCase();
    if (!ext) return 'other';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    return 'other';
  } catch (error) {
    console.error('Error determining file type:', error);
    return 'other';
  }
}

export default function FileGallery({
  existingFiles,
  setExistingFiles,
  onDeleteFile,
}: FileGalleryProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    if (previewIndex === null || existingFiles.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) =>
        prev !== null ? (prev + 1) % existingFiles.length : 0
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [previewIndex, existingFiles.length]);

  const handleDelete = async (fileId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed) return;

    try {
      await onDeleteFile(fileId);
      setExistingFiles(existingFiles.filter((f) => f.id !== fileId));
      // toast.success('File deleted successfully');
      if (previewIndex !== null && existingFiles[previewIndex]?.id === fileId) {
        setPreviewIndex(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete file');
    }
  };

  return (
    <>
      {/* File Grid */}
      <div className="flex flex-wrap gap-3">
        {existingFiles.map((file, idx) => {
          console.log("fileurl=", file.url)
          const type = getFileType(file.url);
          return (
            <div key={file.id} className="relative w-20 h-20 rounded-lg overflow-hidden group bg-gray-100 flex items-center justify-center text-center">
              {type === 'image' ? (
                <div>
                  <Image
                    src={file.url}
                    alt={`File ${idx}`}
                    fill
                    className="object-cover rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer"
                    onClick={() => setPreviewIndex(idx)}
                  />

                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

              ) : (
                <div
                  className="w-full h-full flex items-center justify-center cursor-pointer text-orange-600"
                  onClick={() => setPreviewIndex(idx)}
                >
                  {type === 'pdf' && <FaFilePdf size={32} />}
                  {type === 'word' && <FaFileWord size={32} />}
                  {type === 'excel' && <FaFileExcel size={32} />}
                  {type === 'other' && <FaFileAlt size={32} />}
                </div>
              )}


            </div>
          );
        })}
      </div>

      {/* Fullscreen Preview for image/pdf */}
      {previewIndex !== null && existingFiles[previewIndex] && (
        <div
          onClick={() => setPreviewIndex(null)}
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
        >
          <div
            className="relative w-[80vw] h-[70vh] max-w-2xl mx-auto bg-white p-4 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >




            {/* Render File */}
            {getFileType(existingFiles[previewIndex].url) === 'image' ? (
              <Image
                src={existingFiles[previewIndex].url}
                alt="Full Preview"
                fill
                className="object-contain rounded-lg"
              />
            ) : getFileType(existingFiles[previewIndex].url) === 'pdf' ? (
              <iframe
                src={existingFiles[previewIndex].url}
                className="w-full h-full rounded-lg"
                title="PDF Preview"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-lg font-semibold">Cannot preview this file type.</p>
                <a
                  href={existingFiles[previewIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-500 hover:text-blue-700"
                >
                  Open File
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}