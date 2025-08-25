import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BettingsListTable from "@/components/tables/BettingsListTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Betting List | Kalyan Master 7",
  description: "Betting List",
};

export default async function BettingPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

  const url = `${process.env.NEXT_PUBLIC_CUSTOMER_API_URL}/betting/list?page=1&limit=10`;
  const res = await fetch(url, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  });

  const result = await res.json();

  return (
    <div>
      <PageBreadcrumb pageTitle="Bettings List" />
      <div className="space-y-6">
        <BettingsListTable initialData={result} />
      </div>
    </div>
  );
}
