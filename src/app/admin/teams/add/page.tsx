'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import SummernoteEditor from '@/components/HtmlEditor/SummernoteEditor';
import FileInput from '@/components/form/input/FileInput';
import { toast } from 'react-hot-toast';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLoading } from '@/context/LoadingContext';

const SOCIAL_OPTIONS = [
  'facebook',
  'linkedin',
  'instagram',
  'twitter',
  'github',
  'gmail',
  'youtube',
  'portfolio',
];

export default function AddTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isLoading, setIsLoading } = useLoading();

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [showingOrder, setShowingOrder] = useState<number | null>(null);
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [isSteering, setIsSteering] = useState(false);
  const titleOfPage = id ? 'Update Team' : 'Create Team';

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      (async () => {
        try {
          const response = await fetch(`/api/v1/admin/teams/${id}`, {
            method: 'GET',
            credentials: 'include',
          });

          const result = await response.json();
          if (result.success && result.data) {
            const team = result.data;
            setName(team.name);
            setDesignation(team.designation);
            setDepartment(team.department);
            setDescription(team.description);
            setIsSteering(team.isSteering || false); // Ensure boolean value
            setShowingOrder(team.showingOrder || null)

            // Convert object to array for editing
            if (team.socialLinks && typeof team.socialLinks === 'object') {
              const formattedLinks = Object.entries(team.socialLinks).map(([platform, url]) => ({
                platform,
                url,
              }));
              setSocialLinks(formattedLinks);
            }

            if (team.profileImage) {
              setProfileImageUrl(team.profileImage); // full image URL expected
            }
          } else {
            toast.error('Failed to fetch team data');
          }
        } catch (error) {
          toast.error('Error loading team');
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('designation', designation || '');
    formData.append('department', department || '');
    formData.append('description', description || '');

    formData.append('isSteering', isSteering.toString());

    if (showingOrder !== null) {
      formData.append('showingOrder', showingOrder.toString());
    }

    const socialObject = socialLinks.reduce((acc, curr) => {
      if (curr.platform && curr.url) acc[curr.platform] = curr.url;
      return acc;
    }, {} as Record<string, string>);
    formData.append('socialLinks', JSON.stringify(socialObject));


    if (profileImage) formData.append('profileImage', profileImage);

    const url = id ? `/api/v1/admin/teams/update/${id}` : `/api/v1/admin/teams/create`;
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
      loading: id ? 'Updating team...' : 'Creating team...',
      success: () => {
        // router.push('/admin/teams');
        return id ? 'Team updated successfully!' : 'Team created successfully!';
      },
      error: (err) => err.message || 'Something went wrong',
    });
  };

  const addNewSocialLink = (platform: string) => {
    if (socialLinks.find((s) => s.platform === platform)) return;
    setSocialLinks([...socialLinks, { platform, url: '' }]);
  };

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks];
    updated[index].url = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (platform: string) => {
    setSocialLinks(socialLinks.filter((s) => s.platform !== platform));
  };

  const availableOptions = SOCIAL_OPTIONS.filter(
    (option) => !socialLinks.find((s) => s.platform === option)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={titleOfPage} />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700 w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Enter designation"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter department"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>

          <div className="">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Profile Image</label>
            <div className="flex items-center gap-4">
              {profileImageUrl && !profileImage && (
                <div className="flex-shrink-0">
                  <img
                    src={profileImageUrl}
                    alt="Uploaded profile"
                    className="w-28 h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 border border-gray-200 dark:border-gray-600 transition"
                    onClick={() => window.open(profileImageUrl, '_blank')}
                  />
                </div>
              )}
              <FileInput
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                required={!id}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={isSteering ? 'true' : 'false'}
              onChange={(e) => setIsSteering(e.target.value === 'true')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            >
              <option value="false">Core Team</option>
              <option value="true">Steering Committee Team</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Showing Position</label>
            <input
              type="number"
              min={1}
              step={1}
              value={showingOrder ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setShowingOrder(null);
                } else {
                  const parsed = parseInt(value);
                  if (parsed >= 1) setShowingOrder(parsed);
                }
              }}
              placeholder="Enter number you want to show on frontend"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />


          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <SummernoteEditor
            value={description}
            onChange={setDescription}
            height={300}
            fullWidth
            className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          />

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Social Media Links</label>
          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-3 items-center">
                <span className="capitalize text-sm w-24 text-gray-700 dark:text-gray-300">
                  {link.platform}
                </span>
                <input
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(link.platform)}
                  className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-lg font-bold px-2 transition"
                >
                  ×
                </button>
              </div>
            ))}

            {availableOptions.length > 0 && (
              <div className="mt-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) addNewSocialLink(e.target.value);
                    e.target.selectedIndex = 0;
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                >
                  <option value="">+ Add Platform</option>
                  {availableOptions.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 disabled:opacity-70 transition"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {id ? 'Updating...' : 'Saving...'}
              </span>
            ) : id ? 'Update Team' : 'Save Team'}
          </button>
        </div>
      </form>
    </div>
  );
}
