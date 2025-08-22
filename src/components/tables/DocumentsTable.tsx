'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '../ui/table';

import Pagination from './Pagination';
import PageLoader from '../ui/loading/PageLoader';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
// import Badge from '@/components/ui/badge/Badge';
import { AnimatePresence, motion } from 'framer-motion';

interface Gallery {
    _id: string;
    title: string;
    documents: { url: string; mimetype: string, _id: string, size: number }[];
    isActive: boolean;
    createdAt: string;
}



interface Filters {
    title: string;
}

interface Props {
    initialData: Gallery[];
}
export default function DocumentsListTable({ initialData }: Props) {
    const [allGalleries, setAllGalleries] = useState<Gallery[]>(initialData);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<Filters>({ title: '' });
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const router = useRouter();
    const debouncedFilters = useDebounce(filters, 300);

    const filteredGalleries = useMemo(() => {
        return allGalleries.filter(gallery => {
            const titleMatch = gallery.title
                .toLowerCase()
                .includes(debouncedFilters.title.toLowerCase());
            return titleMatch;
        });
    }, [allGalleries, debouncedFilters]);

    const totalPages = Math.ceil(filteredGalleries.length / pageSize);
    const basePageSizes = [10, 25, 50, 100, 500];

    const pageSizeOptions = useMemo(() => {
        if (filteredGalleries.length === 0) return [10];
        const filtered = basePageSizes.filter(size => size < filteredGalleries.length);
        if (!filtered.includes(filteredGalleries.length)) {
            filtered.push(filteredGalleries.length);
        }
        return [...new Set(filtered)].sort((a, b) => a - b);
    }, [filteredGalleries.length]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredGalleries.slice(start, start + pageSize);
    }, [filteredGalleries, currentPage, pageSize]);

    const fetchAllGalleries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/admin/documents/list/?perPage=${pageSize}`, {
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success && result.data) {
                setAllGalleries(result.data.docs || []);
            } else {
                toast.error(result.message || 'Failed to load documents');
                setAllGalleries([]);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Error fetching documents list');
            setAllGalleries([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchAllGalleries();
    }, [fetchAllGalleries]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({ title: '' });
        setCurrentPage(1);
    };

    const handleToggle = (galleryId: string, currentStatus: boolean) => {
        setAllGalleries(prev =>
            prev.map(item =>
                item._id === galleryId ? { ...item, isActive: !currentStatus } : item
            )
        );
    };

    const changeStatus = async (galleryId: string, currentStatus: boolean) => {
        try {
            const formData = new FormData();
            formData.append('isActive', (!currentStatus).toString());

            const response = await fetch(`/api/v1/admin/documents/update/${galleryId}`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                handleToggle(galleryId, currentStatus);
                toast.success('Status updated');
            } else {
                toast.error(result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating  status:', error);
            toast.error('Error updating  status');
        }
    };

    const handleEdit = (galleryId: string) => {
        router.push(`/admin/links-docs/add?id=${galleryId}`);
    };


    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                    <PageLoader />
                </div>
            )}

            <div className="flex flex-col gap-4 p-4">
                {/* Filter Section */}
                <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-white/[0.05]">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* Page Size */}
                        <div className="flex items-center gap-2 min-w-[150px]">
                            <label className="text-sm font-medium text-gray-700 dark:text-white">
                                Page Size:
                            </label>
                            <select
                                value={pageSize}
                                onChange={e => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="py-1.5 pl-3 pr-6 text-sm border rounded-md bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700 text-gray-800"
                            >
                                {pageSizeOptions.map(size => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Right-side Buttons */}
                        <div className="flex flex-wrap justify-end gap-1">

                            <div className=" mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2 md:flex md:justify-end">
                                <button
                                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                                    className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                                >
                                    <FiFilter className="w-4 h-4" />
                                    {showFilterPanel ? 'Hide Filters' : 'Advanced Filters'}
                                    {showFilterPanel ? (
                                        <FiChevronUp className="w-4 h-4" />
                                    ) : (
                                        <FiChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                                >
                                    <FiX className="w-4 h-4" />
                                    Reset
                                </button>

                                <button
                                    onClick={() => router.push('/admin/gallery/add')}
                                    className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                                >
                                    + Add Gallery
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilterPanel && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden w-full"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-white/[0.05]">
                                {/* Name Filter */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-white">
                                        Title:
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={filters.title}
                                        onChange={handleFilterChange}
                                        placeholder="Search by Title"
                                        className="w-full py-2 px-3 text-sm border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                    />
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[700px] md:min-w-[900px]">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Sr. No.</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Title</TableCell>
                                {/* <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"># Images</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"># Videos</TableCell> */}
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Created At</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {!loading && filteredGalleries.map((galleryInfo, index) => (
                                <TableRow key={galleryInfo._id}>
                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </TableCell>

                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis" title={galleryInfo.title}>
                                        {galleryInfo.title}
                                    </TableCell>

                                    {/* <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis" title={galleryInfo.video_url}>
                                        {galleryInfo.video_url}
                                    </TableCell>
                                
                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {galleryInfo.images ? (
                                            <img
                                                src={galleryInfo.images}
                                                alt="Profile"
                                                className="h-10 w-10 object-cover rounded-full shadow"
                                            />
                                        ) : 'N/A'}
                                    </TableCell> */}

                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {galleryInfo.createdAt ?
                                            new Date(galleryInfo.createdAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                // minute: '2-digit',
                                                // second: '2-digit',
                                                hour12: true
                                            })
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-5 py-2 text-end text-theme-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex justify-end items-center gap-2">
                                            <div key={`${galleryInfo._id}_status`} className="flex items-center space-x-2">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        onChange={() => changeStatus(galleryInfo._id, galleryInfo.isActive)}
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={galleryInfo.isActive ? true : false}
                                                    />
                                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <button
                                                onClick={() => handleEdit(galleryInfo._id)}
                                                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                title="Edit Team"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>

                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </div>
            </div>

            <div className="flex justify-between items-center px-5 py-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredGalleries.length}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
