import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DocumentsTable from "@/components/tables/DocumentsTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Documents List | WIN CoE",
  description: "Documents List",
};

export default async function DocumentsTables() {
  // Get all cookies and format them into a header string
  const cookieStore = cookies();
  const cookieHeader = (await cookieStore).getAll().map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/list`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  const result = await res.json();
  const DocData = result?.data?.docs || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Links & Documents List" />
      <div className="space-y-6">
        <DocumentsTable initialData={DocData} />
      </div>
    </div>
  );
}
