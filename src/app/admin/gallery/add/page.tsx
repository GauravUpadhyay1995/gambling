'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import SummernoteEditor from '@/components/HtmlEditor/SummernoteEditor';
import FileInput from '@/components/form/input/FileInput';
import { toast } from 'react-hot-toast';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLoading } from '@/context/LoadingContext';
import ImageGallery from '@/components/ui/images/ImageGallery';


export default function AddGalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isLoading, setIsLoading } = useLoading();

  const [title, setTitle] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string, id: string }[]>([]);
  const [videos, setVideos] = useState([
    { url: '', title: '', description: '' },
  ]);
  // const [description, setDescription] = useState('');

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      (async () => {
        try {
          const res = await fetch(`/api/v1/admin/gallery/${id}`, {
            method: 'GET',
            credentials: 'include',
          });
          const result = await res.json();
          if (result.success) {
            const data = result.data;
            setTitle(data.title || '');
            setExistingImages(data.images?.map((img: any) => ({
              url: img.url,
              id: img._id // assuming your API returns an id for each document
            })) || []);
            setVideos(data.video_url || []);
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
      setTitle('');
      setExistingImages([]);
      setVideos([]);
    }
  }, [id]);
  const handleVideoChange = (index: number, field: 'url' | 'title' | 'description', value: string) => {
    const updated = [...videos];
    updated[index][field] = value;
    setVideos(updated);
  };

  const handleAddVideo = () => {
    setVideos([...videos, { url: '', title: '', description: '' }]);
  };

  const handleRemoveVideo = (index: number) => {
    const updated = [...videos];
    updated.splice(index, 1);
    setVideos(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    images.forEach(img => formData.append('images', img));
    formData.append('video_url', JSON.stringify(videos));

    const url = id ? `/api/v1/admin/gallery/update/${id}` : `/api/v1/admin/gallery/create`;
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
      loading: id ? 'Updating gallery...' : 'Creating gallery...',
      success: () => {
        router.push('/admin/gallery');
        return id ? 'Gallery updated successfully!' : 'Gallery created successfully!';
      },
      error: (err) => err.message || 'Something went wrong',
    }, {
      // Add this options object to customize position and styling
      position: 'top-center',
      style: {
        minWidth: '250px',
        transform: 'translateX(0) translateY(0)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
      className: 'toast-center',
    });
  };

  const handleImageDelete = async (fileId: string) => {
    if (!id) {
      toast.error('Gallery ID is missing');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/admin/gallery/update/${id}/image/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      setIsLoading(false);
      return result;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to delete image');
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
      <PageBreadcrumb pageTitle={id ? 'Edit Gallery' : 'Add Gallery'} />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700 w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
            <div className="flex items-center gap-4 flex-wrap">

              <ImageGallery
                existingImages={existingImages}
                setExistingImages={setExistingImages}
                onDeleteImage={handleImageDelete}
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

          <div className="md:col-span-3 space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Videos</label>
            {videos.map((video, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md relative"
              >
                {/* Video URL - spans 2 columns */}
                <input
                  type="url"
                  value={video.url}
                  onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                  placeholder="Enter embedded video URL (e.g., https://www.youtube.com/embed/...)"
                  className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white md:col-span-2"
                />

                {/* Title */}
                <input
                  type="text"
                  value={video.title}
                  onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                  placeholder="Video Title"
                  className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                />

                {/* Description */}
                <input
                  type="text"
                  value={video.description}
                  onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                />

                {/* Remove Button */}
                {index > 0 && (
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 text-red-500 text-xs"
                    onClick={() => handleRemoveVideo(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddVideo}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add more video
            </button>
          </div>


        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <SummernoteEditor
            value={description}
            onChange={setDescription}
            height={300}
            fullWidth
            className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          />
        </div> */}

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
            {isLoading ? 'Saving...' : id ? 'Update Gallery' : 'Save Gallery'}
          </button>
        </div>
      </form>
    </div>
  );
}