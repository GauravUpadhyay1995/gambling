// app/components/common/Loader.tsx
'use client';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500">
      <div className="w-12 h-12 border-4 border-indigo-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}
