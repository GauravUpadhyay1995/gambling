import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CustomersListTable from "@/components/tables/CustomersListTable";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Users List | Kalyan Master 7",
  description: "Users List",
};

export default async function CustomersTables() {
const url=`${process.env.NEXT_PUBLIC_CUSTOMER_API_URL}/list?perPage=25`

  const res = await fetch(url);
  console.log("url>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", url);

  const result = await res.json();
  const usersData = result?.data?.customers || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Customers List" />
      <div className="space-y-6">
        <CustomersListTable initialData={usersData} />
      </div>
    </div>
  );
}
