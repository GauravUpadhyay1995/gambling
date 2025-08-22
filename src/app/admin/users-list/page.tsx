import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UsersListTable from "@/components/tables/UsersListTable";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Users List | WIN CoE",
  description: "Users List",
};

export default async function UsersTables() {
  // ✅ Properly extract and format cookies for API auth
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/list?perPage=25`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store', // ensures fresh server data
  });

  const result = await res.json();
  const usersData = result?.data?.customers || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Users List" />
      <div className="space-y-6">
        <UsersListTable initialData={usersData} />
      </div>
    </div>
  );
}
