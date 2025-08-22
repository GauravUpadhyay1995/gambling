'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import SummernoteEditor from '@/components/HtmlEditor/SummernoteEditor';
import FileInput from '@/components/form/input/FileInput';
import { toast } from 'react-hot-toast';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLoading } from '@/context/LoadingContext';

export default function AddTrlPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isLoading, setIsLoading } = useLoading();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [requirement, setRequirement] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      (async () => {
        try {
          const res = await fetch(`/api/v1/admin/trl/${id}`, {
            method: 'GET',
            credentials: 'include',
          });
          const result = await res.json();
          if (result.success) {
            const trl = result.data;
            setTitle(trl.title || '');
            setDuration(trl.duration || '');
            setAmount(trl.amount || '');
            setRequirement(trl.requirement || '');
            setTag(trl.tag || '');
            setDescription(trl.description || '');
            setBannerUrl(trl.banner || '');
          } else {
            toast.error('Failed to fetch TRL data');
          }
        } catch (error) {
          toast.error('Error fetching TRL data');
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
      setDuration('');
      setAmount('');
      setRequirement( '');
      setTag('');
      setDescription('');
      setBannerUrl('');
      setEditorKey(prev => prev + 1);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('duration', duration);
    formData.append('amount', amount);
    formData.append('requirement', requirement);
    formData.append('tag', tag);
    formData.append('description', description);

    if (banner) {
      if (!banner.type.startsWith('image/')) {
        toast.error('Only image files are allowed for the banner');
        return;
      }
      formData.append('banner', banner);
    }

    const url = id ? `/api/v1/admin/trl/update/${id}` : `/api/v1/admin/trl/create`;
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
      loading: id ? 'Updating TRL...' : 'Creating TRL...',
      success: () => {
        router.push('/admin/trl');
        return id ? 'TRL updated successfully!' : 'TRL created successfully!';
      },
      error: (err) => err.message || 'Something went wrong',
    });
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
      <PageBreadcrumb pageTitle={id ? 'Edit TRL' : 'Add TRL'} />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700 w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Accelerator Grant (A Grant)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Maximum 2 years"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="Up to ₹50 Lakhs/year"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirement</label>
            <input
              type="text"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="TRL 5 → TRL 7 (Proof-of-concept to early validation)"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tag</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="TRL 5-7"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner (Image only)</label>
            <div className="flex items-center gap-4">
              {bannerUrl && !banner && (
                <img
                  src={bannerUrl}
                  alt="Current Banner"
                  className="w-32 h-20 object-cover border rounded cursor-pointer hover:opacity-80 transition"
                  onClick={() => window.open(bannerUrl!, '_blank')}
                />
              )}
              <FileInput
                accept="image/*"
                onChange={(e) => setBanner(e.target.files?.[0] || null)}
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
            {isLoading ? 'Saving...' : id ? 'Update TRL' : 'Save TRL'}
          </button>
        </div>
      </form>
    </div>
  );
}
