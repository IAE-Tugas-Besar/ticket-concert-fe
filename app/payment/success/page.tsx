"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import {
    CheckCircle2,
    Ticket,
    Mail,
    ArrowRight,
    PartyPopper,
    Calendar,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import confetti from "@/lib/confetti";

interface OrderItem {
    ticketTypeId: string;
    name: string;
    quantity: number;
    price: number;
}

interface CompletedOrder {
    orderId: string;
    midtransOrderId: string;
    concertTitle: string;
    items: OrderItem[];
    totalPrice: number;
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
}

export default function PaymentSuccessPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [order, setOrder] = useState<CompletedOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect if not authenticated
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        // Load completed order from localStorage
        const stored = localStorage.getItem("completedOrder");
        if (stored) {
            try {
                const orderData = JSON.parse(stored) as CompletedOrder;
                setOrder(orderData);

                // Trigger confetti animation
                setTimeout(() => {
                    confetti();
                }, 300);
            } catch {
                router.push("/concerts");
            }
        } else {
            router.push("/concerts");
        }
        setIsLoading(false);
    }, [authLoading, isAuthenticated, router]);

    const getTotalTickets = () => {
        if (!order) return 0;
        return order.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    if (authLoading || isLoading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Memuat...</p>
                    </div>
                </main>
            </>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-background via-background to-green-500/5 py-12 px-6">
                <div className="container mx-auto max-w-2xl">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                            Pembayaran Berhasil!
                            <PartyPopper className="w-8 h-8 text-yellow-500" />
                        </h1>
                        <p className="text-muted-foreground">
                            Terima kasih! Tiket Anda sudah berhasil dipesan.
                        </p>
                    </div>

                    {/* Order Summary Card */}
                    <Card className="mb-6 overflow-hidden">
                        <div className="bg-primary p-4 text-primary-foreground">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Ticket className="w-5 h-5" />
                                    <span className="font-semibold">Order #{order.midtransOrderId}</span>
                                </div>
                                <span className="text-sm bg-white/20 px-2 py-1 rounded">CONFIRMED</span>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-4">{order.concertTitle}</h3>

                            {/* Ticket List */}
                            <div className="space-y-3 mb-6">
                                {order.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center py-2 border-b last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity} tiket
                                            </p>
                                        </div>
                                        <p className="font-semibold">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="border-t pt-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatPrice(order.totalPrice)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Jumlah Tiket</p>
                                    <p className="text-2xl font-bold">{getTotalTickets()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <Card className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-medium">E-Ticket Terkirim</p>
                                    <p className="text-sm text-muted-foreground">
                                        Cek email untuk melihat e-ticket Anda
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Calendar className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="font-medium">Jangan Lupa!</p>
                                    <p className="text-sm text-muted-foreground">
                                        Tunjukkan e-ticket di pintu masuk
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/dashboard/tickets" className="flex-1">
                            <Button className="w-full h-12" variant="default">
                                <Ticket className="w-4 h-4 mr-2" />
                                Lihat Tiket Saya
                            </Button>
                        </Link>
                        <Link href="/concerts" className="flex-1">
                            <Button className="w-full h-12" variant="outline">
                                Jelajahi Konser Lain
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Help Text */}
                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Butuh bantuan?{" "}
                        <Link href="/help" className="text-primary hover:underline">
                            Hubungi Customer Service
                        </Link>
                    </p>
                </div>
            </main>
        </>
    );
}
