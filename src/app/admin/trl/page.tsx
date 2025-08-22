// app/admin/trl/page.tsx (or news/page.tsx if you meant that)

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TRLListTable from "@/components/tables/TRLListTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "TRL List | WIN CoE",
  description: "TRL List",
};

export default async function TRLTables() {
  // ✅ Correct way to format cookies for headers
  const cookieStore = cookies();
  const cookieHeader = (await cookieStore)
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trl/list`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store", // ⛔ disable caching so you always get latest data
  });

  const result = await res.json();
  const TRLsData = result?.data?.trls || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="TRL List" />
      <div className="space-y-6">
        <TRLListTable initialData={TRLsData} />
      </div>
    </div>
  );
}
