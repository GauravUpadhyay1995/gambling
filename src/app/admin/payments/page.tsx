import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentsListTable from "@/components/tables/PaymentsListTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Payment List | Kalyan Master 7",
  description: "Payment List",
};

export default async function PaymentPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

  const url = `${process.env.NEXT_PUBLIC_CUSTOMER_API_URL}/payment?page=1&limit=10`;
  const res = await fetch(url, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  });

  const result = await res.json();

  return (
    <div>
      <PageBreadcrumb pageTitle="Payment List" />
      <div className="space-y-6">
        <PaymentsListTable initialData={result} />
      </div>
    </div>
  );
}
