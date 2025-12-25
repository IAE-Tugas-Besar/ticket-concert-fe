"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-background">
                <AdminSidebar />
                <main className="lg:pl-64 transition-all duration-300">
                    <div className="container mx-auto p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
