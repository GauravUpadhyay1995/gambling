import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NewsListTable from "@/components/tables/NewsListTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "News List | WIN CoE",
  description: "News List",
};

export default async function NewsTables() {
  // ✅ Properly format all cookies as a header string
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  // ✅ API call using server-side cookies
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/news/list/?perPage=25`,
    {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store", // prevent stale data
    }
  );

  const result = await res.json();
  const newsData = result?.data?.news || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="News List" />
      <div className="space-y-6">
        <NewsListTable initialData={newsData} />
      </div>
    </div>
  );
}
