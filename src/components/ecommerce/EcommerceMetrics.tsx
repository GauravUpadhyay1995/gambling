"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from '@/context/AuthContext';
// import Badge from "../ui/badge/Badge";
import {
  // ArrowDownIcon,
  // ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "@/icons";

import { formatNumber } from "@/hooks/useNumberFormate";

interface DashboardData {
  users: {
    activeUserCount: number;
    inActiveUserCount: number;
    userCount: number;
  };
  customers: {
    customerCount: number;
    piadCustomerCount: number;
    unPaidCustomerCount: number;
    fullPaymentTypeCustomerCount: number;
    settlementPaymentTypeCustomerCount: number;
    partialPaymentTypeCustomerCount: number;
  };
  payments: {
    foreClosureSum: string;
    paidForeClosureSum: string;
    settlementSum: string;
    paidSettlementSum: string;
    partialSum: string;
    paidPartialSum: string;
  };
}

export const EcommerceMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const { admin } = useAuth();
  const permissions = admin?.permissions;
  // console.log(permissions);

  const hasPermission = (module: string, action: string) => {
    return permissions?.some(
      (perm) => perm.module === module && perm.actions.includes(action)
    ) || false;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/admin/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    setLoading(false);

    // fetchData();
  }, []);
  useEffect(() => {
  const styles = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .animate-slideIn {
      animation: slideIn 0.5s ease-out forwards;
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  return () => {
    document.head.removeChild(styleSheet); // Cleanup on unmount
  };
}, []);


  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-40"
          ></div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { customers, users, payments } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {/* Merged Users */}
      {hasPermission('User', 'read') && (
        <MetricCard
          title="Users"
          value={users.userCount}
          icon={<GroupIcon className="text-blue-600 size-6 dark:text-blue-300" />}
          subValues={[
            { label: "Active", value: users.activeUserCount, color: "white" },
            { label: "Inactive", value: users.inActiveUserCount, color: "white" },
          ]}
        />
      )}


      {hasPermission('Customer', 'read') && (
        <>
          {/* Customers */}
          <MetricCard
            title="Customers"
            value={(customers.customerCount)}
            icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
            subValues={[
              { label: "Paid", value: (customers.piadCustomerCount), color: "white" },
              { label: "Unpaid", value: customers.unPaidCustomerCount, color: "white" },
            ]}
          />

          {/* Total Paid Amount */}
          <MetricCard
            title="Total Paid"
            prefix="₹ "
            value={formatNumber(
              parseFloat(payments.paidForeClosureSum) +
              parseFloat(payments.paidSettlementSum) +
              parseFloat(payments.paidPartialSum)
            )}

            icon={<BoxIconLine className="text-yellow-600 size-6 dark:text-yellow-400" />}
            subValues={[
              { label: "Foreclosure", value: `₹${formatNumber(parseFloat(payments.paidForeClosureSum))}`, color: "white" },
              { label: "Settlement", value: `₹${formatNumber(parseFloat(payments.paidSettlementSum))}`, color: "white" },
              { label: "Partial", value: `₹${formatNumber(parseFloat(payments.paidPartialSum))}`, color: "white" },
            ]}
          />

          {/* Foreclosure Payment */}
          <MetricCard
            title="Foreclosure Payment"
            value={formatNumber(parseFloat(payments.foreClosureSum))}
            prefix="₹ "
            icon={<BoxIconLine className="text-purple-600 size-6 dark:text-purple-400" />}
            subValues={[
              {
                label: "Paid",
                value: `₹${formatNumber(parseFloat(payments.paidForeClosureSum))}`,
                color: "white",
              },
              {
                label: "Pending",
                value: `₹${formatNumber(
                  parseFloat(payments.foreClosureSum) - parseFloat(payments.paidForeClosureSum)
                )}`,
                color: "white",
              },
            ]}
          />

          {/* Settlement Payment */}
          <MetricCard
            title="Settlement Payment"
            value={formatNumber(parseFloat(payments.settlementSum))}
            prefix="₹ "
            icon={<BoxIconLine className="text-cyan-600 size-6 dark:text-cyan-400" />}
            subValues={[
              {
                label: "Paid",
                value: `₹${formatNumber(parseFloat(payments.paidSettlementSum))}`,
                color: "white",
              },
              {
                label: "Pending",
                value: `₹${formatNumber(
                  parseFloat(payments.settlementSum) - parseFloat(payments.paidSettlementSum)
                )}`,
                color: "white",
              },
            ]}
          />

          {/* Partial Payment */}
          <MetricCard
            title="Partial Payment"
            value={formatNumber(parseFloat(payments.partialSum))}
            prefix="₹ "
            icon={<BoxIconLine className="text-orange-600 size-6 dark:text-orange-400" />}
            subValues={[
              {
                label: "Paid",
                value: `₹${formatNumber(parseFloat(payments.paidPartialSum))}`,
                color: "white",
              },
              {
                label: "Pending",

                value: `₹${formatNumber(
                  parseFloat(payments.partialSum) - parseFloat(payments.paidPartialSum)
                )}`,
                color: "white",
              },
            ]}
          />
        </>
      )}


    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  icon: React.ReactNode;
  subValues?: {
    label: string;
    value: number | string;
    color?: string;
  }[];
}

const MetricCard = ({
  title,
  value,
  prefix = "",
  icon,
  subValues = [],
}: MetricCardProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] animate-fadeIn">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800 transition-transform duration-300 hover:scale-110">
            {icon}
          </div>
          <div>

            <span className="text-xl font-medium text-gray-500 dark:text-gray-400 animate-slideIn">{title}</span>
            <h4 className="font-bold text-gray-800 text-base dark:text-white/90 animate-slideIn">
              {prefix}
              {typeof value === "number" ? value.toLocaleString() : value}
            </h4>
          </div>
        </div>
      </div>

      {subValues.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xl animate-fadeIn">
          {subValues.map((sub, index) => (
            <div
              key={sub.label}
              className="flex justify-between items-center transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md px-2 py-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {(() => {
                return (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500`}
                  >
                    {sub.label}
                  </span>
                );
              })()}


              <span
                className={`font-medium ${sub.color === "gray"
                  ? "text-gray-600"
                  : sub.color === "red"
                    ? "text-gray-500"
                    : "text-gray-800 dark:text-white"
                  }`}
              >
                {typeof sub.value === "number" ? sub.value.toLocaleString() : sub.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add these styles at the top of the file after the imports


// Add this right after the styles constant

