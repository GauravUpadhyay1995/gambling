"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Pagination from "../tables/Pagination";
import PageLoader from "../ui/loading/PageLoader";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Payment {
    _id: string;
    amount: number;
    transactionId: string;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    customer: {
        name: string;
        mobile: string;
        _id?: string;
    };
}

interface PaymentApiResponse {
    success: boolean;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: Payment[];
}

interface Props {
    initialData: PaymentApiResponse;
}

export default function PaymentsListTable({ initialData }: Props) {
    const [payments, setPayments] = useState<Payment[]>(initialData.data || []);
    const [currentPage, setCurrentPage] = useState(initialData.page || 1);
    const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
    const [limit, setLimit] = useState(initialData.limit || 10);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [amount, setAmount] = useState("");
    const [verifying, setVerifying] = useState(false);

    const fetchPayments = useCallback(
        async (page: number, perPage: number) => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_CUSTOMER_API_URL}/payment?page=${page}&limit=${perPage}`,
                    { credentials: "include" }
                );
                const result: PaymentApiResponse = await response.json();

                if (result.success) {
                    setPayments(result.data);
                    setTotalPages(result.totalPages);
                    setCurrentPage(result.page);
                } else {
                    toast.error("Failed to load payment data");
                }
            } catch (error) {
                console.error("Error fetching payments:", error);
                toast.error("Error fetching payment list");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchPayments(currentPage, limit);
    }, [currentPage, limit, fetchPayments]);

    const exportToExcel = () => {
        if (!payments.length) {
            toast.error("No data to export");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(
            payments.map((payment, idx) => ({
                "Sr No.": (currentPage - 1) * limit + idx + 1,
                "Date": new Date(payment.createdAt).toLocaleString(),
                "Customer": payment.customer.name,
                "TransactionId": payment.transactionId,
                "isApproved": payment.isApproved ? "Approved" : "Pending",
                "Amount": payment.amount,
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `payments_page_${currentPage}.xlsx`);
    };

    const openVerifyModal = (payment: Payment) => {
        setSelectedPayment(payment);
        setAmount(payment.amount.toString());
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
        setAmount("");
        setVerifying(false);
    };

    const verifyPayment = async () => {
        if (!selectedPayment || !amount) {
            toast.error("Please enter amount");
            return;
        }

        try {
            setVerifying(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_CUSTOMER_API_URL}/payment/${selectedPayment._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isApproved: true,
                        amount: parseFloat(amount),
                    }),
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (result.success) {
                toast.success("Payment verified successfully!");
                closeModal();
                fetchPayments(currentPage, limit);
            } else {
                toast.error(result.message || "Verification failed");
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Error verifying payment");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                    <PageLoader />
                </div>
            )}

            {/* Verify Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                        <h2 className="text-xl font-semibold mb-4">Verify Payment</h2>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Transaction ID
                            </label>
                            <input
                                type="text"
                                value={selectedPayment?.transactionId || ""}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Amount *
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={verifying}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={verifyPayment}
                                disabled={verifying}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {verifying ? "Verifying..." : "Verify Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end p-4">
                <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
                >
                    Export to Excel
                </button>
            </div>
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[700px] md:min-w-[900px]">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Sr. No.
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Date
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Customer
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Transaction ID
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Approved
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Amount
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {!loading && payments.length > 0 ? (
                                payments.map((payment, idx) => (
                                    <TableRow key={payment._id}>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {(currentPage - 1) * limit + idx + 1}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {new Date(payment.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {payment.customer.name}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {payment.transactionId}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {payment.isApproved ? "Approved" : "Pending"}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {payment.amount}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            <button
                                                onClick={() => openVerifyModal(payment)}
                                                disabled={payment.isApproved}
                                                className={`px-3 py-1 text-white text-xs rounded-md transition ${
                                                    payment.isApproved
                                                        ? 'bg-green-600 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                            >
                                                {payment.isApproved ? 'Verified' : 'Verify Txn ID'}
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-5 py-4 text-theme-sm text-center">
                                        No payments found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex justify-between items-center px-5 py-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={initialData.total}
                    onPageChange={(page) => setCurrentPage(page)}
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                        className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[10, 20, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}