// app/admin/teams/page.tsx (or news/page.tsx if you're using it under "news")

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TeamsListTable from "@/components/tables/TeamsListTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Teams List | WIN CoE",
  description: "Teams List",
};

export default async function TeamsTables() {
  // ✅ Proper cookie formatting
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  // ✅ Server-side API call with cookies
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/list`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store", // always fetch fresh data
  });

  const result = await res.json();
  const teamsData = result?.data?.teams || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Teams List" />
      <div className="space-y-6">
        <TeamsListTable initialData={teamsData} />
      </div>
    </div>
  );
}
