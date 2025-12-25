"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Music,
    ShoppingBag,
    Ticket,
    LogOut,
    ChevronLeft,
    Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
    {
        title: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Concerts",
        href: "/admin/concerts",
        icon: Music,
    },
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
    },
    {
        title: "Tickets",
        href: "/admin/tickets",
        icon: Ticket,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <>
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setCollapsed(!collapsed)}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
                    collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-64",
                    "lg:translate-x-0"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b px-4">
                        {!collapsed && (
                            <Link href="/admin" className="flex items-center gap-2">
                                <Ticket className="h-6 w-6 text-primary" />
                                <span className="font-bold text-lg">Admin Panel</span>
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <ChevronLeft
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    collapsed && "rotate-180"
                                )}
                            />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-4">
                        {menuItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/admin" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {!collapsed && <span>{item.title}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info & Logout */}
                    <div className="border-t p-4">
                        {!collapsed && user && (
                            <div className="mb-3 px-3">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
                                collapsed && "justify-center px-0"
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>Logout</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {!collapsed && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setCollapsed(true)}
                />
            )}
        </>
    );
}
