'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/context/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '../ui/table';
import Pagination from '../tables/Pagination';
import PageLoader from '../ui/loading/PageLoader';

interface UsersApiResponse {
    success: boolean;
    message?: string;
    isAuthorized?: boolean;
    data?: {
        customers?: User[];
        totalRecords?: number;
        perPage?: number;
    };
}

interface User {
    _id: string;
    name: string;
    mobile?: string;
    isActive?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface Filters {
    name: string;
    mobile: string;
}

interface Props {
    initialData: User[];
}

export default function UsersListTable({ initialData }: Props) {
    const [allUsers, setAllUsers] = useState<User[]>(initialData);
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        name: '',
        mobile: '',
    });

    const debouncedFilters = useDebounce(filters, 300);
    const { admin } = useAuth();

    const basePageSizes = [10, 25, 50, 100, 500];

    const getPageSizeOptions = useCallback(() => {
        if (totalRecords === 0) return [10];
        const filtered = basePageSizes.filter((size) => size < totalRecords);
        if (!filtered.includes(totalRecords)) {
            filtered.push(totalRecords);
        }
        return [...new Set(filtered)].sort((a, b) => a - b);
    }, [totalRecords]);

    const pageSizeOptions = getPageSizeOptions();

    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_CUSTOMER_API_URL}/list?perPage=${pageSize}`,
                {
                    credentials: 'include',
                }
            );
            const result: UsersApiResponse = await response.json();

            if (result.success && result.data) {
                setAllUsers(result.data.customers || []);
                setTotalRecords(result.data.totalRecords || 0);
                setTotalPages(
                    Math.max(
                        1,
                        Math.ceil((result.data.totalRecords || 0) / (result.data.perPage || pageSize))
                    )
                );
            } else {
                toast.error(result.message || 'Failed to load users');
                setAllUsers([]);
                setTotalRecords(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching user list');
            setAllUsers([]);
            setTotalRecords(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    const filteredUsers = useMemo(() => {
        let result = [...allUsers];

        if (debouncedFilters.name) {
            result = result.filter((user) =>
                user.name.toLowerCase().includes(debouncedFilters.name.toLowerCase())
            );
        }
        if (debouncedFilters.mobile) {
            result = result.filter((user) =>
                user.mobile?.toLowerCase().includes(debouncedFilters.mobile.toLowerCase())
            );
        }

        return result;
    }, [allUsers, debouncedFilters]);

    useEffect(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setUserList(filteredUsers.slice(start, end));
        setTotalPages(Math.ceil(filteredUsers.length / pageSize));
        setTotalRecords(filteredUsers.length);
    }, [currentPage, pageSize, filteredUsers]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const changeStatus = async (userId: string, isActive: boolean) => {
        if (!userId) return;

        const toUpdateData = {
            isActive: !isActive,
        };

        const promise = fetch(`/api/v1/admin/users/update/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(toUpdateData),
        }).then(async (res) => {
            try {
                const text = await res.text();
                const result = text ? JSON.parse(text) : {};

                if (!res.ok || !result.success) {
                    toast.error(result.message || 'Update failed');
                }

                return result;
            } catch (error) {
                console.error('Failed to parse response:', error);
                toast.error('Invalid server response');
                throw new Error('Invalid server response');
            }
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: (res) => (res?.success ? 'User updated successfully!' : null),
            error: (err) => err.message || 'Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchAllUsers();
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({
            name: '',
            mobile: '',
        });
        setCurrentPage(1);
    };

    const handleDownloadExcel = () => {
        const data = userList.map((cust, idx) => ({
            'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
            Name: cust.name,
            Status: cust.isActive ? 'Active' : 'InActive',
            CreatedAt: cust?.createdAt || 'N/A',
            UpdatedAt: cust?.updatedAt || 'N/A',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const header = ['Sr. No.', 'Name', 'Status', 'CreatedAt', 'UpdatedAt'];
        XLSX.utils.sheet_add_aoa(ws, [header], { origin: 'A1' });

        header.forEach((_, idx) => {
            const cell = ws[XLSX.utils.encode_cell({ r: 0, c: idx })];
            if (cell)
                cell.s = {
                    font: { bold: true, color: { rgb: '1E293B' } },
                    fill: { fgColor: { rgb: 'E5E7EB' } },
                    alignment: { horizontal: 'center', vertical: 'center' },
                };
        });

        ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        ws['!panes'] = [
            { ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' },
        ];
        ws['!autofilter'] = { ref: `A1:F${data.length + 2}` };
        ws['!cols'] = [
            { wch: 8 },
            { wch: 18 },
            { wch: 14 },
            { wch: 14 },
            { wch: 14 },
        ];

        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const fileName = `users_list_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
            now.getDate()
        )}_${pad(now.getHours())}_${pad(now.getMinutes())}-${pad(now.getMilliseconds())}.xlsx`;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                    <PageLoader />
                </div>
            )}

            <div className="flex flex-col gap-4 p-4">
                <div className="border-b border-gray-200 dark:border-white/[0.05] flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 min-w-[150px]">
                            <label className="text-sm font-medium text-gray-700 dark:text-white whitespace-nowrap">
                                Page Size:
                            </label>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 cursor-pointer"
                            >
                                {pageSizeOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <a
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
                        </a>

                        <a
                            onClick={resetFilters}
                            className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                        >
                            <FiX className="w-4 h-4" />
                            Reset Filters
                        </a>
                    </div>

                    <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:flex md:justify-end">
                        <a
                            onClick={handleDownloadExcel}
                            className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                        >
                            Download
                        </a>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilterPanel && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden w-full"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-white/[0.05]">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-white">
                                        Name:
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={filters.name}
                                        onChange={handleFilterChange}
                                        className="w-full py-2 px-3 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg dark:bg-dark-900 h-9 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                        placeholder="Search by name"
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
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500"
                                >
                                    Sr. No.
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500"
                                >
                                    Created/Updated
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500"
                                >
                                    Name
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500"
                                >
                                    Mobile
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500"
                                >
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {!loading &&
                                userList.map((user, index) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </TableCell>
                                        <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                            {user?.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    hour12: true,
                                                })
                                                : 'N/A'}
                                            <br></br>
                                            {user?.updatedAt
                                                ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    hour12: true,
                                                })
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                            {user.name}
                                        </TableCell>
                                        <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                            {user.mobile}
                                        </TableCell>

                                        <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center space-x-2">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        onChange={() =>
                                                            changeStatus(user._id, user.isActive ?? true)
                                                        }
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={user.isActive ? true : false}
                                                    />
                                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                                                </label>
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
                    totalItems={totalRecords}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
        </div>
    );
}