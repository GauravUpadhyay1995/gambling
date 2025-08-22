'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import SummernoteEditor from '@/components/HtmlEditor/SummernoteEditor';
import FileInput from '@/components/form/input/FileInput';
import { toast } from 'react-hot-toast';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLoading } from '@/context/LoadingContext';
import FileGallery from '@/components/ui/images/DocumentsLinks';


export default function AddGalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isLoading, setIsLoading } = useLoading();

  const [title, setTitle] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string, id: string }[]>([]);
  const [publishDate, setPublishDate] = useState('');

  const [editorKey, setEditorKey] = useState(0);

  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      (async () => {
        try {
          const res = await fetch(`/api/v1/admin/documents/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          const result = await res.json();
          if (result.success) {
            const data = result.data;
            setTitle(data.title || '');
            setDescription(data.description || '');
            setPublishDate(data.publishDate ? data.publishDate.split('T')[0] : '');

            setExistingImages(data.documents?.map((img: any) => ({
              url: img.url,
              id: img._id // assuming your API returns an id for each document
            })) || []);



          } else {
            toast.error('Failed to fetch gallery data');
          }
        } catch (error) {
          toast.error('Error fetching gallery data');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [id]);
  useEffect(() => {
    if (!id) {
      // reset form fields when there's no ID
      setTitle('');
      setDescription('');
      setPublishDate('');
      setExistingImages([]);
      setImages([]);
      setEditorKey(prev => prev + 1);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    const isoDate = new Date(publishDate).toISOString();
    formData.append('publishDate', isoDate);
    images.forEach(img => formData.append('documents', img));

    const url = id ? `/api/v1/admin/documents/update/${id}` : `/api/v1/admin/documents/create`;
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
      loading: id ? 'Updating ...' : 'Creating ...',
      success: () => {
        router.push('/admin/links-docs');
        return id ? 'Updated successfully!' : 'Created successfully!';
      },
      error: (err) => err.message || 'Something went wrong',
    });
  };
  const handleImageDelete = async (fileId: string) => {
    if (!id) {
      toast.error('Document ID is missing');
      return;
    }

    try {
      setIsLoading(true); // Add loading state
      const res = await fetch(`/api/v1/admin/documents/update/${id}/image/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      // Update the existingImages state by filtering out the deleted image
      setExistingImages(prevImages => prevImages.filter(img => img.id !== fileId));

      toast.success('File deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image');
    } finally {
      setIsLoading(false); // Remove loading state
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }



  return (
    <div>
      <PageBreadcrumb pageTitle={id ? 'Edit Doc & Links' : 'Add Doc & Links'} />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700 w-full space-y-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Event Title"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publish Date</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Event Title"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documents</label>
            <div className="flex items-center gap-4 flex-wrap">

              <FileGallery
                existingFiles={existingImages}
                setExistingFiles={setExistingImages}
                onDeleteFile={handleImageDelete}
              />


              <FileInput
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                required={!id}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <SummernoteEditor
            key={editorKey}
            value={description}
            onChange={setDescription}
            height={300}
            fullWidth
            className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition"
          >
            {isLoading ? 'Saving...' : id ? 'Update Doc & Links' : 'Save Doc & Links'}
          </button>
        </div>
      </form>
    </div>
  );
}