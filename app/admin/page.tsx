"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/stats-card";
import { useAuth } from "@/lib/auth-context";
import {
    Music,
    ShoppingBag,
    Ticket,
    DollarSign,
    Loader2,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Concert {
    id: string;
    title: string;
    venue: string;
    startAt: string;
    status: string;
    ticketTypes: {
        id: string;
        quotaTotal: number;
        quotaSold: number;
        price: string;
    }[];
}

interface Stats {
    totalConcerts: number;
    publishedConcerts: number;
    draftConcerts: number;
    endedConcerts: number;
    totalTicketsSold: number;
    totalRevenue: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function AdminOverviewPage() {
    const { token } = useAuth();
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalConcerts: 0,
        publishedConcerts: 0,
        draftConcerts: 0,
        endedConcerts: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch concerts
                const res = await fetch(`${API_URL}/concerts?limit=100`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (data.success && data.data) {
                    const concertList = data.data as Concert[];
                    setConcerts(concertList);

                    // Calculate stats
                    const published = concertList.filter(c => c.status === "PUBLISHED").length;
                    const draft = concertList.filter(c => c.status === "DRAFT").length;
                    const ended = concertList.filter(c => c.status === "ENDED").length;

                    let totalSold = 0;
                    let totalRevenue = 0;

                    concertList.forEach(concert => {
                        concert.ticketTypes.forEach(tt => {
                            totalSold += tt.quotaSold;
                            totalRevenue += tt.quotaSold * parseFloat(tt.price);
                        });
                    });

                    setStats({
                        totalConcerts: concertList.length,
                        publishedConcerts: published,
                        draftConcerts: draft,
                        endedConcerts: ended,
                        totalTicketsSold: totalSold,
                        totalRevenue: totalRevenue,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const recentConcerts = concerts
        .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">
                    Selamat datang di Admin Panel Concert Ticketing
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Konser"
                    value={stats.totalConcerts}
                    description={`${stats.publishedConcerts} published, ${stats.draftConcerts} draft`}
                    icon={Music}
                />
                <StatsCard
                    title="Tiket Terjual"
                    value={stats.totalTicketsSold}
                    description="Total semua konser"
                    icon={Ticket}
                />
                <StatsCard
                    title="Total Pendapatan"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={DollarSign}
                />
                <StatsCard
                    title="Konser Aktif"
                    value={stats.publishedConcerts}
                    description="Status Published"
                    icon={TrendingUp}
                />
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Concerts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Konser Terbaru</CardTitle>
                        <Link
                            href="/admin/concerts"
                            className="text-sm text-primary hover:underline"
                        >
                            Lihat Semua
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentConcerts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada konser
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentConcerts.map((concert) => (
                                    <div
                                        key={concert.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {concert.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {concert.venue} • {formatDate(concert.startAt)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                concert.status === "PUBLISHED"
                                                    ? "default"
                                                    : concert.status === "DRAFT"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                        >
                                            {concert.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Concert Status Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Status Konser</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    <span className="text-sm">Published</span>
                                </div>
                                <span className="font-medium">{stats.publishedConcerts}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                    <span className="text-sm">Draft</span>
                                </div>
                                <span className="font-medium">{stats.draftConcerts}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-gray-500" />
                                    <span className="text-sm">Ended</span>
                                </div>
                                <span className="font-medium">{stats.endedConcerts}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/concerts"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Music className="h-4 w-4" />
                            Kelola Konser
                        </Link>
                        <Link
                            href="/admin/orders"
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Lihat Orders
                        </Link>
                        <Link
                            href="/admin/tickets"
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                        >
                            <Ticket className="h-4 w-4" />
                            Validasi Tiket
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
