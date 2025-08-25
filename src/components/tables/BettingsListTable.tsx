"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Pagination from "../tables/Pagination";
import PageLoader from "../ui/loading/PageLoader";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Betting {
    _id: string;
    createdAt: string;
    status: string;
    market_name: string;
    rating_name: string;
    customer_name: string;
    choosen_number: string; // Added to match usage in table
}

interface BettingApiResponse {
    success: boolean;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: Betting[];
}

interface Props {
    initialData: BettingApiResponse;
}

export default function BettingsListTable({ initialData }: Props) {
    const [bettings, setBettings] = useState<Betting[]>(initialData.data || []);
    const [currentPage, setCurrentPage] = useState(initialData.page || 1);
    const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
    const [limit, setLimit] = useState(initialData.limit || 10);
    const [loading, setLoading] = useState(false);

    const fetchBettings = useCallback(
        async (page: number, perPage: number) => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_CUSTOMER_API_URL}/betting/list?page=${page}&limit=${perPage}`,
                    { credentials: "include" }
                );
                const result: BettingApiResponse = await response.json();

                if (result.success) {
                    setBettings(result.data);
                    setTotalPages(result.totalPages);
                    setCurrentPage(result.page);
                } else {
                    toast.error("Failed to load betting data");
                }
            } catch (error) {
                console.error("Error fetching bettings:", error);
                toast.error("Error fetching betting list");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // refetch when page or limit changes
    useEffect(() => {
        fetchBettings(currentPage, limit);
    }, [currentPage, limit, fetchBettings]);
  const exportToExcel = () => {
    if (!bettings.length) {
      toast.error("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      bettings.map((b, idx) => ({
        "Sr No.": (currentPage - 1) * limit + idx + 1,
        "Date": new Date(b.createdAt).toLocaleString(),
        "Customer": b.customer_name,
        "Market": b.market_name,
        "Rating": b.rating_name,
        "Status": b.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bettings");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `bettings_page_${currentPage}.xlsx`);
  };
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                    <PageLoader />
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
                                    Market
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Game Type
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs">
                                    Betting Number
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {!loading &&
                                bettings.map((betting, idx) => (
                                    <TableRow key={betting._id}>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {(currentPage - 1) * limit + idx + 1}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {new Date(betting.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {betting.customer_name}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {betting.market_name}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {betting.rating_name}
                                        </TableCell>
                                        <TableCell className="px-5 py-2 text-theme-sm text-center">
                                            {betting.choosen_number}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex justify-between items-center px-5 py-4">
                {/* Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={initialData.total}
                    onPageChange={(page) => setCurrentPage(page)}
                />

                {/* Rows per page dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                        className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setCurrentPage(1); // reset to first page
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
