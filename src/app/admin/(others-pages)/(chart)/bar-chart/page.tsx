'use client';

import dynamic from 'next/dynamic';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

// Dynamically import the chart component with no SSR
const BarChartOne = dynamic(
  () => import("@/components/charts/bar/BarChartOne"),
  { ssr: false }
);

export default function BarChartPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
