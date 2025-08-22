import AdminLoginForm from "@/components/auth/AdminLoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WIN CoE - Admin Login",
  keywords: "WIN CoE, Admin Login, Admin Dashboard",
  description: "WIN CoE admin panel login page for managing the platform.",
};

export default function AdminLogin() {
  return <AdminLoginForm />;
} 