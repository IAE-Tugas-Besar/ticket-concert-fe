"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import {
    User,
    Mail,
    Calendar,
    Shield,
    Ticket,
    ShoppingBag,
    Settings,
    LogOut,
    ChevronRight,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Memuat profil...</p>
                    </div>
                </main>
            </>
        );
    }

    if (!user) {
        return null;
    }

    const menuItems = [
        {
            href: "/dashboard/tickets",
            icon: Ticket,
            title: "Tiket Saya",
            description: "Lihat dan kelola tiket konser",
            color: "text-blue-500 bg-blue-500/10",
        },
        {
            href: "/dashboard/orders",
            icon: ShoppingBag,
            title: "Riwayat Pesanan",
            description: "Lihat semua riwayat pembelian",
            color: "text-purple-500 bg-purple-500/10",
        },
        {
            href: "/dashboard/settings",
            icon: Settings,
            title: "Pengaturan",
            description: "Ubah password dan preferensi",
            color: "text-gray-500 bg-gray-500/10",
        },
    ];

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                <div className="container mx-auto max-w-4xl py-8 px-6">
                    {/* Profile Header */}
                    <Card className="mb-8 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{user.name}</h1>
                                    <p className="opacity-90">{user.email}</p>
                                    <Badge variant="secondary" className="mt-2 bg-white/20 text-white hover:bg-white/30">
                                        <Shield className="w-3 h-3 mr-1" />
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Nama</p>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Bergabung</p>
                                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Menu */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Menu Cepat</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {menuItems.map((item) => (
                                <Link href={item.href} key={item.href}>
                                    <Card className="p-4 hover:shadow-md transition-all cursor-pointer group h-full">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${item.color}`}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <Card className="p-4">
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Keluar dari Akun
                        </Button>
                    </Card>
                </div>
            </main>
            <Footer />
        </>
    );
}
