'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import SummernoteEditor from '@/components/HtmlEditor/SummernoteEditor';


import FileInput from '@/components/form/input/FileInput';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLoading } from '@/context/LoadingContext'; // adjust path as needed



export default function AddNewsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isLoading, setIsLoading } = useLoading();


  const [categoryName, setCategoryName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [editorKey, setEditorKey] = useState(0);


  useEffect(() => {
    if (id) {
      setIsLoading(true); // Start loading
      (async () => {
        try {
          const response = await fetch(`/api/v1/admin/news/${id}`, {
            method: 'GET',
            credentials: 'include',
          });

          const result = await response.json();
          if (result.success && result.data) {
            const news = result.data;
            setTitle(news.title);
            setCategoryName(news.category);
            setDescription(news.description);
          } else {
            toast.error('Failed to fetch news data');
          }
        } catch (error) {
          toast.error('Error loading news');
          console.error(error);
        } finally {
          setIsLoading(false); // Stop loading
        }
      })();
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      // reset form fields when there's no ID
      setTitle('');
      setDescription('');
      setTitle('');
      setCategoryName('');
      setDescription('');
      setEditorKey(prev => prev + 1);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categoryName);
    if (image) formData.append('bannerImage', image);

    const url = id
      ? `/api/v1/admin/news/update/${id}`
      : `/api/v1/admin/news/create`;

    const method = id ? 'PATCH' : 'POST';

    const promise = fetch(url, {
      method,
      credentials: 'include',
      body: formData,
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Submission failed');
      }
      return result;
    });

    toast.promise(promise, {
      loading: id ? 'Updating news...' : 'Creating news...',
      success: (res) => {
        router.push('/admin/news');
        return id ? 'News updated successfully!' : 'News created successfully!';
      },
      error: (err) => err.message || 'Something went wrong',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen /> {/* ✅ Use your custom loading component */}
      </div>
    );
  }
  return (
    <div>
      <PageBreadcrumb pageTitle="Add News" />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-100 dark:border-white/10 w-full space-y-6"
      >
        {/* Top 3 fields in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Category
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              placeholder='Enter category name'
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
          </div>

          {/* Title input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder='Enter title'
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
          </div>

          {/* File input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Upload Image
            </label>
            <FileInput onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </div>
        </div>

        {/* Summernote Description Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Description
          </label>
          
          <SummernoteEditor
            key={editorKey}
            value={description}
            onChange={setDescription}
            height={300}
            fullWidth
          />

        </div>


        <div className="flex justify-end items-center mt-6 gap-3 w-full flex-wrap">
          {/* Back button (right) */}
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md text-sm hover:bg-gray-300 transition"
          >
            Back
          </button>

          {/* Submit button (right) */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            {isLoading
              ? id
                ? 'Updating...'
                : 'Saving...'
              : id
                ? 'Update News'
                : 'Save News'}
          </button>

        </div>


      </form>
    </div>
  );
}
