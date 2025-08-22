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

import Pagination from '../tables/Pagination';
import PageLoader from '../ui/loading/PageLoader';
import { toast } from 'react-hot-toast';
import { FiFilter, FiChevronDown, FiChevronUp, FiX, } from 'react-icons/fi';
import { PencilIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import Badge from "@/components/ui/badge/Badge";
import { useRouter } from 'next/navigation';

interface NewsApiResponse {
    success: boolean;
    message?: string;
    isAuthorized?: boolean;
    data?: {
        news?: News[];
        totalRecords?: number;
        perPage?: number;
    };
}

interface News {
    _id: string;
    title: string;
    category: string;
    description: string;
    bannerImage: string;
    isActive: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

interface Filters {
    title: string;
    category: string;
}

interface Props {
    initialData: News[];
}

export default function NewsListTable({ initialData }: Props) {
    const [allNews, setAllNews] = useState<News[]>(initialData);

    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<Filters>({ title: '', category: '' });
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const router = useRouter();
    const debouncedFilters = useDebounce(filters, 300);
    const filteredNews = useMemo(() => {
        return allNews.filter(news => {
            const titleMatch = news.title
                .toLowerCase()
                .includes(debouncedFilters.title.toLowerCase());
            const categoryMatch = news.category
                .toLowerCase()
                .includes(debouncedFilters.category.toLowerCase());
            return titleMatch && categoryMatch;
        });
    }, [allNews, debouncedFilters]);

    const totalPages = Math.ceil(filteredNews.length / pageSize);
    const currentPageData = filteredNews.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const basePageSizes = [10, 25, 50, 100, 500];
    const pageSizeOptions = useMemo(() => {
        if (filteredNews.length === 0) return [10];
        const filtered = basePageSizes.filter(size => size < filteredNews.length);
        if (!filtered.includes(filteredNews.length)) {
            filtered.push(filteredNews.length);
        }
        return [...new Set(filtered)].sort((a, b) => a - b);
    }, [filteredNews.length]);

    const fetchAllNews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/admin/news/list/?perPage=${pageSize}`, {
                credentials: 'include',
            });
            const result: NewsApiResponse = await response.json();
            if (result.success && result.data) {
                setAllNews(result.data.news || []);
            } else {
                toast.error(result.message || 'Failed to load news');
                setAllNews([]);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Error fetching news list');
            setAllNews([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchAllNews();
    }, [fetchAllNews]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({ title: '', category: '' });
        setCurrentPage(1);
    };

    const changeStatus = async (newsId: string, currentStatus: boolean) => {
        try {
            const formData = new FormData();
            formData.append('isActive', (!currentStatus).toString()); // Toggle status

            const response = await fetch(`/api/v1/admin/news/update/${newsId}`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData,
            });

            const result: NewsApiResponse = await response.json();

            if (result.success) {
                setAllNews(prev =>
                    prev.map(item =>
                        item._id === newsId
                            ? { ...item, isActive: !currentStatus } // ✅ Update isActive here
                            : item
                    )
                );
                toast.success('News status updated');
            } else {
                toast.error(result.message || 'Failed to update news status');
            }
        } catch (error) {
            console.error('Error updating news status:', error);
            toast.error('Error updating news status');
        }
    };


    const handleEdit = (newsId: string) => {
        router.push(`/admin/news/add?id=${newsId}`);
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
                                    onClick={() => router.push('/admin/news/add')}
                                    className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                                >
                                    + Add News
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
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-white">
                                        Title:
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={filters.title}
                                        onChange={handleFilterChange}
                                        placeholder="Search by title"
                                        className="w-full py-2 px-3 text-sm border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-white">
                                        Category:
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={filters.category}
                                        onChange={handleFilterChange}
                                        placeholder="Search by category"
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
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Title</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Category</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Banner</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Created At</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-end text-theme-xs text-gray-500">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {!loading && allNews.map((news, index) => (
                                <TableRow key={news._id}>
                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </TableCell>

                                    <TableCell
                                        className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis"
                                        title={news.title}
                                    >
                                        {news.title}
                                    </TableCell>

                                    <TableCell
                                        className="px-5 py-2 text-start text-theme-sm capitalize text-gray-600 dark:text-gray-400 max-w-[150px] truncate whitespace-nowrap overflow-hidden text-ellipsis"
                                        title={news.category || 'N/A'}
                                    >
                                        {news.category || 'N/A'}
                                    </TableCell>



                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {news.bannerImage ? (
                                            <img
                                                src={news.bannerImage}
                                                alt="Banner"
                                                className="h-10 w-16 object-cover rounded shadow"
                                            />
                                        ) : 'N/A'}
                                    </TableCell>

                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {news.createdAt ? new Date(news.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                // minute: '2-digit',
                                                // second: '2-digit',
                                                hour12: true
                                            }) : 'N/A'}
                                    </TableCell>

                                    <TableCell className="px-5 py-2 text-end text-theme-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex justify-end items-center gap-2">

                                            <div key={`${news._id}_new`} className="flex items-center space-x-2">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        onChange={() => changeStatus(news._id, news.isActive ?? true)}
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={news.isActive ? true : false}

                                                    />
                                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
                                                    </div>
                                                </label>
                                            </div>

                                            <button
                                                onClick={() => handleEdit(news._id)}
                                                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                title="Edit News"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            {/* <button
                                                onClick={() => handleDelete(news._id)}
                                                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                                title="Delete News"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button> */}
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
                    totalItems={filteredNews.length}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
