import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import GalleriesTable from "@/components/tables/GalleriesTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Gallery List | WIN CoE",
  description: "Gallery List",
};

export default async function GalleriesTables() {
  // Get all cookies and format them into a header string
  const cookieStore = cookies();
  const cookieHeader = (await cookieStore).getAll().map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/list`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  const result = await res.json();
  const GalleriesData = result?.data?.galleries || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Gallery List" />
      <div className="space-y-6">
        <GalleriesTable initialData={GalleriesData} />
      </div>
    </div>
  );
}
