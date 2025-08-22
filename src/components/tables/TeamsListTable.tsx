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
        teams?: Teams[];
        totalRecords?: number;
        perPage?: number;
    };
}

interface Teams {
    isActive: any;
    _id: string;
    id: number;
    name: string;
    designation: string;
    department: string;
    profileImage: string;
    status: boolean;
    createdAt: string;
    updated_at: string;
}

interface Filters {
    name: string;
    designation: string;
    department: string;
}

interface Props {
    initialData: Teams[];
}

export default function NewsListTable({ initialData }: Props) {
    const [allTeams, setAllTeams] = useState<Teams[]>(initialData);
    // console.log('>>>>>>',allTeams);

    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<Filters>({ name: '', designation: '', department: '' });
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const router = useRouter();
    const debouncedFilters = useDebounce(filters, 300);

    const filteredTeams = useMemo(() => {
        return allTeams.filter(team => {
            const nameMatch = team.name
                .toLowerCase()
                .includes(debouncedFilters.name.toLowerCase());
            const designationMatch = team.designation
                .toLowerCase()
                .includes(debouncedFilters.designation.toLowerCase());
            const departmentMatch = team.department
                .toLowerCase()
                .includes(debouncedFilters.department.toLowerCase());

            return nameMatch && designationMatch && departmentMatch;
        });
    }, [allTeams, debouncedFilters]);

    const totalPages = Math.ceil(filteredTeams.length / pageSize);
    const basePageSizes = [10, 25, 50, 100, 500];

    const pageSizeOptions = useMemo(() => {
        if (filteredTeams.length === 0) return [10];
        const filtered = basePageSizes.filter(size => size < filteredTeams.length);
        if (!filtered.includes(filteredTeams.length)) {
            filtered.push(filteredTeams.length);
        }
        return [...new Set(filtered)].sort((a, b) => a - b);
    }, [filteredTeams.length]);


    const fetchAllTeams = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/admin/teams/list/?perPage=${pageSize}`, {
                credentials: 'include',
            });
            const result: NewsApiResponse = await response.json();
            // console.log('>>>>>>',result);

            if (result.success && result.data) {
                setAllTeams(result.data.teams || []);
            } else {
                toast.error(result.message || 'Failed to load news');
                setAllTeams([]);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Error fetching news list');
            setAllTeams([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchAllTeams();
    }, [fetchAllTeams]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({ name: '', designation: '', department: '' });
        setCurrentPage(1);
    };

    const handleToggle = (teamId: string, currentStatus: boolean) => {
        setAllTeams(prev =>
            prev.map(item =>
                item._id === teamId
                    ? { ...item, isActive: !currentStatus }
                    : item
            )
        );
    };


    const changeStatus = async (teamId: string, currentStatus: boolean) => {
        try {

            const formData = new FormData();
            formData.append('isActive', (!currentStatus).toString()); // Toggle status

            const response = await fetch(`/api/v1/admin/teams/update/${teamId}`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData,
            });

            const result: NewsApiResponse = await response.json();

            if (result.success) {
                handleToggle(teamId, currentStatus)
                toast.success('Team status updated');
            } else {
                toast.error(result.message || 'Failed to update Team status');
            }

        } catch (error) {
            console.error('Error updating Team status:', error);
            toast.error('Error updating Team status');
        }
    };


    const handleEdit = (teamId: string) => {
        router.push(`/admin/teams/add?id=${teamId}`);
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
                                    onClick={() => router.push('/admin/teams/add')}
                                    className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                                >
                                    + Add Team
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
                                        Name:
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={filters.name}
                                        onChange={handleFilterChange}
                                        placeholder="Search by name"
                                        className="w-full py-2 px-3 text-sm border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                    />
                                </div>

                                {/* Designation Filter */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-white">
                                        Designation:
                                    </label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={filters.designation}
                                        onChange={handleFilterChange}
                                        placeholder="Search by designation"
                                        className="w-full py-2 px-3 text-sm border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                    />
                                </div>

                                {/* Department Filter */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-white">
                                        Department:
                                    </label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={filters.department}
                                        onChange={handleFilterChange}
                                        placeholder="Search by department"
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
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Frontend Position.</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Name</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Designation</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Department</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Profile</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Created At</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-end text-theme-xs text-gray-500">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {!loading && allTeams.map((team, index) => (
                                <TableRow key={team._id}>
                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </TableCell>
                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis" title={team.showingOrder}>
                                        {team.showingOrder}
                                    </TableCell>

                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis" title={team.name}>
                                        {team.name}
                                    </TableCell>

                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate whitespace-nowrap overflow-hidden text-ellipsis" title={team.designation}>
                                        {team.designation}
                                    </TableCell>

                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {team.department || 'N/A'}
                                    </TableCell>

                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {team.profileImage ? (
                                            <img
                                                src={team.profileImage}
                                                alt="Profile"
                                                className="h-10 w-10 object-cover rounded-full shadow"
                                            />
                                        ) : 'N/A'}
                                    </TableCell>

                                    <TableCell className="px-5 py-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        {team.createdAt ?
                                            new Date(team.createdAt).toLocaleString('en-US', {
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
                                            <div key={`${team.id}_status`} className="flex items-center space-x-2">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        onChange={() => changeStatus(team._id, team.isActive)}
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={team.isActive ? true : false}
                                                    />
                                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <button
                                                onClick={() => handleEdit(team._id)}
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
                    totalItems={filteredTeams.length}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
