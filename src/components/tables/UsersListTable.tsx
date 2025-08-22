'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '../ui/table';
import Button from '@/components/ui/button/Button';
import Pagination from '../tables/Pagination';
import PageLoader from '../ui/loading/PageLoader';
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import { toast } from 'react-hot-toast';
import { useModal } from "@/hooks/useModal";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { UserPermissionGuard } from '@/components/common/PermissionGuard';
import UnauthorizedComponent from '@/components/common/UnauthorizedComponent';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { stat } from 'fs';

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

interface Permission {
    module: string;
    actions: string[];
    _id?: string;
}

interface UpdateUserData {
    name: string;
    email: string;
    mobile: string;
    role?: string;
    isActive: boolean;
    permissions: Omit<Permission, '_id'>[];
    password?: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
    permissions?: Permission[];
    __v?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface Filters {
    name: string;
    email: string;
}

const PermissionToggle = ({
    module,
    permissions,
    setPermissions
}: {
    module: string;
    permissions: Permission[];
    setPermissions: (permissions: Permission[]) => void;
}) => {
    const availableActions = ['create', 'read', 'update', 'delete'];
    const modulePermissions = permissions.find(p => p.module == module) || { module, actions: [] };

    const toggleAction = (action: string) => {
        const newPermissions = permissions.map(perm =>
            perm.module === module
                ? {
                    module,
                    actions: perm.actions.includes(action)
                        ? perm.actions.filter(a => a !== action)
                        : [...perm.actions, action]
                }
                : perm
        );
        setPermissions(newPermissions);
    };

    const toggleSelectAll = (checked: boolean) => {
        const newPermissions = checked
            ? [
                ...permissions.filter(p => p.module !== module),
                { module, actions: [...availableActions] }
            ]
            : [
                ...permissions.filter(p => p.module !== module),
                { module, actions: [] }
            ];
        setPermissions(newPermissions);
    };

    const allSelected = availableActions.every(action =>
        modulePermissions.actions.includes(action)
    );

    return (
        <div className="border p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{module}</h4>
                <div className="flex items-center space-x-2">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={allSelected}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-purple-600">
                        </div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            All
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex flex-row gap-2">
                {availableActions.map(action => (
                    <div key={action} className="flex items-center gap-2">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={modulePermissions.actions.includes(action)}
                                onChange={() => toggleAction(action)}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-purple-600">
                            </div>
                            <span className="ms-3 text-xs font-medium text-gray-900 dark:text-gray-300 capitalize">
                                {action}
                            </span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PermissionManager = ({
    permissions,
    setPermissions
}: {
    permissions: Permission[];
    setPermissions: (permissions: Permission[]) => void;
}) => {
    const availableModules = useCallback(() => ['User', 'Customer', 'Coupon'], []);

    // Initialize permissions if empty
    useEffect(() => {
        if (permissions.length === 0) {
            setPermissions(
                availableModules().map(module => ({
                    module,
                    actions: []
                }))
            );
        }
    }, [availableModules, permissions.length, setPermissions]);

    return (
        <div className="space-y-4">
            {availableModules().map(module => (
                <PermissionToggle
                    key={module}
                    module={module}
                    permissions={permissions}
                    setPermissions={setPermissions}
                />
            ))}
        </div>
    );
};

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
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        isActive: true,
        role: '', // or 'admin'
        permissions: [] as Permission[]
    });

    const [createformData, setCreateFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        role: 'user', // or 'admin'
        permissions: [] as Permission[]
    });

    const { isOpen, openModal, closeModal } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basicDetails');
    const [filters, setFilters] = useState<Filters>({
        name: '',
        email: '',
    });

    // Debounced filters with 300ms delay
    const debouncedFilters = useDebounce(filters, 300);

    const tabs = [
        { id: 'basicDetails', label: 'Basic Details' },
        // { id: 'permissions', label: 'Permissions' },
    ];

    const basePageSizes = [10, 25, 50, 100, 500];
    const { admin } = useAuth();

    const getPageSizeOptions = useCallback(() => {
        if (totalRecords === 0) return [10];
        const filtered = basePageSizes.filter((size) => size < totalRecords);
        if (!filtered.includes(totalRecords)) {
            filtered.push(totalRecords);
        }
        return [...new Set(filtered)].sort((a, b) => a - b);
    }, [totalRecords]);

    const pageSizeOptions = getPageSizeOptions();

    // Fetch all users initially
    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/admin/users/list?perPage=${pageSize}`, {
                credentials: 'include',
            });
            const result: UsersApiResponse = await response.json();

            if (result.success && result.data) {
                setAllUsers(result.data.customers || []);
                setTotalRecords(result.data.totalRecords || 0);
                setTotalPages(Math.max(1, Math.ceil((result.data.totalRecords || 0) / (result.data.perPage || pageSize))));
                setIsAuthorized(true);
            } else if (result.isAuthorized === false) {
                setIsAuthorized(false);
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

    // Filter users client-side based on filters and pagination
    const filteredUsers = useMemo(() => {
        let result = [...allUsers];

        // Apply text filters
        if (debouncedFilters.name) {
            result = result.filter(user =>
                user.name.toLowerCase().includes(debouncedFilters.name.toLowerCase())
            );
        }
        if (debouncedFilters.email) {
            result = result.filter(user =>
                user.email.toLowerCase().includes(debouncedFilters.email.toLowerCase())
            );
        }

        return result;
    }, [allUsers, debouncedFilters]);

    // Update paginated list when filters or pagination changes
    useEffect(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setUserList(filteredUsers.slice(start, end));
        setTotalPages(Math.ceil(filteredUsers.length / pageSize));
        setTotalRecords(filteredUsers.length);
    }, [currentPage, pageSize, filteredUsers]);

    // Initial fetch
    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleEditClick = (user: User) => {
        // console.log('>>>>>',user);

        setEditUserId(user._id);
        setFormData({
            name: user.name,
            email: user.email,
            mobile: user.mobile ?? '',
            password: '',
            role: user.role ?? '',
            isActive: user.isActive ?? true,
            permissions: user.permissions || []
        });
        openModal();
    };

    const handleCreateClick = () => {
        setCreateFormData({
            name: '',
            email: '',
            password: '',
            mobile: '',
            role: 'user',
            permissions: []
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = async () => {
        if (!createformData.name || !createformData.email || !createformData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        const promise = fetch(`/api/v1/admin/users/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...createformData,
                isActive: true,
                permissions: createformData.permissions
            }),
        }).then(async (res) => {
            const result = await res.json();
            if (!res.ok || !result.success) {
                toast.error(result.message);
            }
            return result;
        });

        toast.promise(promise, {
            loading: 'Creating user...',
            success: (res) => res?.success ? 'User created successfully!' : null,
            error: (err) => err.message || 'Creation failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchAllUsers();
                setCreateFormData({ name: '', email: '', password: '', mobile: '', role: 'user', permissions: [] });
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            console.error('Create error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const changeStatus = async (userId: string, isActive: boolean, email: string) => {
        if (!userId) return;
        setIsSubmitting(true);

        const toUpdateData = {
            email,
            isActive: !isActive,
        };

        const promise = fetch(`/api/v1/admin/users/update/${userId}`, {
            method: 'PATCH', // ✅ Changed from PUT to PATCH
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
            success: (res) => res?.success ? 'User updated successfully!' : null,
            error: (err) => err.message || 'Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchAllUsers();
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editUserId) return;

        if (!formData.name || !formData.email) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        // Create update data without _id in permissions
        const updateData: UpdateUserData = {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            role: formData.role,
            isActive: formData.isActive,
            permissions: formData.permissions.map(({ ...rest }) => rest)
        };

        if (formData.password?.trim()) {
            updateData.password = formData.password.trim();
        }

        const promise = fetch(`/api/v1/admin/users/update/${editUserId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        }).then(async (res) => {
            const result = await res.json();
            if (!res.ok || !result.success) {
                toast.error(result.message);
            }
            return result;
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: (res) => res?.success ? 'User updated successfully!' : null,
            error: (err) => err.message || 'Update failed',
        });

        try {
            const result = await promise;
            if (result.success) {
                fetchAllUsers();
                closeModal();
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({
            name: '',
            email: '',
        });
        setCurrentPage(1);
    };

    const handleDownloadExcel = () => {
        // Prepare data for Excel
        const data = userList.map((cust, idx) => ({
            'Sr. No.': (currentPage - 1) * pageSize + idx + 1,
            'Name': cust.name,
            'Email': cust.email,
            'Status': cust.isActive ? 'Active' : 'InActive',
            'CreatedAt': cust?.createdAt || "N/A",
            'UpdatedAt': cust?.updatedAt || "N/A",
        }));

        // Create sheet
        const ws = XLSX.utils.json_to_sheet(data);
        // Add header row manually for bold/freeze/filter
        const header = [
            'Sr. No.',
            'Name',
            'Email',
            'Status',
            'CreatedAt',
            'UpdatedAt'
        ];
        XLSX.utils.sheet_add_aoa(ws, [header], { origin: 'A1' });
        // Style header row: bold, dark text, neutral background
        header.forEach((_, idx) => {
            const cell = ws[XLSX.utils.encode_cell({ r: 0, c: idx })];
            if (cell) cell.s = {
                font: { bold: true, color: { rgb: '1E293B' } }, // Tailwind slate-800
                fill: { fgColor: { rgb: 'E5E7EB' } }, // Tailwind slate-200
                alignment: { horizontal: 'center', vertical: 'center' },
            };
        });
        // Freeze header row (for both Excel and Google Sheets compatibility)
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        ws['!panes'] = [{ ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' }];
        // Add autofilter to header row
        ws['!autofilter'] = { ref: `A1:F${data.length + 2}` };
        // Set column widths
        ws['!cols'] = [
            { wch: 8 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
            { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 10 }
        ];

        // Name file with date/time
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const fileName = `users_list_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}_${pad(now.getMinutes())}-${pad(now.getMilliseconds())}.xlsx`;
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, fileName);
    };

    if (!isAuthorized) {
        return <UnauthorizedComponent />;
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                    <PageLoader />
                </div>
            )}

            <UserPermissionGuard action="create">
                <div className="flex flex-col gap-4 p-4">
                    {/* Main Filters Section */}
                    <div className="border-b border-gray-200 dark:border-white/[0.05] flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Page Size Selector */}
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
                                    {pageSizeOptions.map((size, index) => (
                                        <option key={index * size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Advanced Filter Toggle */}
                            <a
                                onClick={() => setShowFilterPanel(!showFilterPanel)}
                                className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                            >
                                <FiFilter className="w-4 h-4" />
                                {showFilterPanel ? "Hide Filters" : "Advanced Filters"}
                                {showFilterPanel ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                            </a>

                            {/* Reset Filters */}
                            <a
                                onClick={resetFilters}
                                className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                            >
                                <FiX className="w-4 h-4" />
                                Reset Filters
                            </a>
                        </div>

                        {/* Add User & Download - 2nd row on small devices */}
                        <div className=" mb-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:flex md:justify-end">
                            <a
                                onClick={handleCreateClick}
                                className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                            >
                                Add User
                            </a>
                            <a
                                onClick={handleDownloadExcel}
                                className="inline-flex items-center px-4 py-2 justify-center gap-2 rounded-full font-medium text-sm bg-blue-light-500/15 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 cursor-pointer"
                            >
                                Download
                            </a>
                        </div>
                    </div>

                    {/* Advanced Filter Panel */}
                    <AnimatePresence>
                        {showFilterPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden w-full"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-white/[0.05]">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white">Name:</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={filters.name}
                                            onChange={handleFilterChange}
                                            className="w-full py-2 px-3 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg dark:bg-dark-900 h-9 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                            placeholder="Search by name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white">Email:</label>
                                        <input
                                            type="text"
                                            name="email"
                                            value={filters.email}
                                            onChange={handleFilterChange}
                                            className="w-full py-2 px-3 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg dark:bg-dark-900 h-9 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                            placeholder="Search by email"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </UserPermissionGuard>

            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[700px] md:min-w-[900px]">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Sr. No.</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Created/Updated</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Name</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Email</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Role</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Status</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {!loading && userList.map((user, index) => (
                                <TableRow key={user._id}>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400"> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                // minute: '2-digit',
                                                // second: '2-digit',
                                                hour12: true
                                            }) : 'N/A'}<br></br>{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                // minute: '2-digit',
                                                // second: '2-digit',
                                                hour12: true
                                            }) : 'N/A'}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400"> {user.name}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">{user.email}</TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                            {user.role || 'User'}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <div key={`${user._id}_new`} className="flex items-center space-x-2">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    onChange={() => changeStatus(user._id, user.isActive ?? true, user.email)}
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={user.isActive ? true : false}
                                                    disabled={admin?.email == user.email}
                                                />
                                                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
                                                </div>
                                            </label>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-1 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                        <UserPermissionGuard action="update">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                                                title="Edit user"
                                                aria-label={`Edit ${user.name}`}
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                        </UserPermissionGuard>
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

            {/* Edit User Modal */}
            <Modal isOpen={isOpen} onClose={() => { setEditUserId(null); closeModal(); }} className=" mt-16 p-5 lg:p-8">
                <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white ">
                    Update User: {formData.name}
                </h4>

                <div className="max-w-4xl mx-auto ">
                    <div className="flex rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-theme-xs">
                        {/* Tab Buttons */}
                        <div className="w-1/4 border-r border-gray-300 dark:border-gray-700 p-2">
                            {tabs.map((tab) => {
                                const isEditingOwnProfile = admin?.email == formData?.email;

                                // If admin is editing their own profile, only show "Basic Details"
                                if (isEditingOwnProfile && tab.label !== 'Basic Details') {
                                    return null;
                                }

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full mt-4 py-1 pl-3 pr-8 text-sm rounded-lg text-left appearance-none h-10 shadow-theme-xs focus:outline-hidden focus:ring-1 bg-none transition-all ${activeTab === tab.id
                                            ? 'bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-200 border border-brand-100 dark:border-brand-100'
                                            : 'text-gray-800 bg-transparent border border-transparent dark:text-white/90 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="w-3/4 p-4 text-sm text-gray-700 dark:text-white/90">
                            {activeTab === 'basicDetails' && (
                                <div className="flex flex-col gap-3">
                                    <Label>Name</Label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <Label>Email</Label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled={admin?.email === formData?.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <Label>Password</Label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Leave blank to keep current password"
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <Label>Mobile</Label>
                                    <input
                                        type="text"
                                        value={formData.mobile || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value) && value.length <= 10) {
                                                setFormData({ ...formData, mobile: value });
                                            }
                                        }}
                                        placeholder="Enter 10-digit mobile number"
                                        maxLength={10}
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <Label>Status</Label>
                                    <select
                                        disabled={admin?.email === formData?.email}
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={(e) =>
                                            setFormData({ ...formData, isActive: e.target.value === 'active' })
                                        }
                                        className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>

                                    <Label>Role</Label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                        className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                    </select>

                                </div>


                            )}
                            {activeTab === 'permissions' && (
                                <div className="space-y-4">
                                    <PermissionManager
                                        permissions={formData.permissions}
                                        setPermissions={(perms) => setFormData({ ...formData, permissions: perms })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setEditUserId(null);
                            closeModal();
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleUpdate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : "Update"}
                    </Button>
                </div>
            </Modal>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                className="p-5 lg:p-8  mt-16"
            >
                <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                    Create New User
                </h4>
                <div className="max-w-4xl mx-auto mt-10">
                    <div className="flex rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-theme-xs">
                        {/* Tab Buttons */}
                        <div className="w-1/4 border-r border-gray-300 dark:border-gray-700 p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full mt-4 py-1 pl-3 pr-8 text-sm rounded-lg text-left appearance-none h-10 shadow-theme-xs focus:outline-hidden focus:ring-1 bg-none transition-all ${activeTab === tab.id ? 'bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-200 border border-brand-100 dark:border-brand-100' : 'text-gray-800 bg-transparent border border-transparent dark:text-white/90 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="w-3/4 p-4 text-sm text-gray-700 dark:text-white/90">
                            {activeTab === 'basicDetails' && (
                                <div className="flex flex-col gap-3">
                                    <Label>Name</Label>
                                    <input
                                        type="text"
                                        value={createformData.name}
                                        onChange={(e) => setCreateFormData({ ...createformData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <Label>Email</Label>
                                    <input
                                        type="email"
                                        value={createformData.email}
                                        onChange={(e) => setCreateFormData({ ...createformData, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <Label>Password</Label>
                                    <input
                                        type="password"
                                        value={createformData.password}
                                        onChange={(e) => setCreateFormData({ ...createformData, password: e.target.value })}
                                        placeholder="Enter password"
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <Label>Mobile</Label>
                                    <input
                                        type="text"
                                        value={createformData.mobile}
                                        maxLength={10}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value) && value.length <= 10) {
                                                setCreateFormData({ ...createformData, mobile: value });
                                            }
                                        }}
                                        placeholder="Enter 10-digit mobile number"
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <Label>Role</Label>
                                    <select
                                        value={createformData.role}
                                        onChange={(e) => setCreateFormData({ ...createformData, role: e.target.value })}
                                        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                    </select>


                                </div>

                            )}
                            {activeTab === 'permissions' && (
                                <div className="space-y-4">
                                    <PermissionManager
                                        permissions={createformData.permissions}
                                        setPermissions={(perms) => setCreateFormData({ ...createformData, permissions: perms })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleCreateSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}