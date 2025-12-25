"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import {
    ShoppingBag,
    Calendar,
    Clock,
    Loader2,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { graphqlRequest, GET_USER_ORDERS, Order } from "@/lib/graphql";
import Script from "next/script";

// Midtrans Client Key
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-YOUR_CLIENT_KEY";

// Extend window for Midtrans Snap
declare global {
    interface Window {
        snap: {
            pay: (
                token: string,
                options: {
                    onSuccess: (result: unknown) => void;
                    onPending: (result: unknown) => void;
                    onError: (result: unknown) => void;
                    onClose: () => void;
                }
            ) => void;
        };
    }
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "-";
    try {
        // Handle epoch timestamp string (like '1753038000000')
        const timestamp = parseInt(dateString, 10);
        const date = !isNaN(timestamp) ? new Date(timestamp) : new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "-";
    }
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    PENDING: {
        label: "Menunggu",
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        icon: Clock,
    },
    AWAITING_PAYMENT: {
        label: "Menunggu Pembayaran",
        color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        icon: CreditCard,
    },
    PAID: {
        label: "Dibayar",
        color: "bg-green-500/10 text-green-600 border-green-500/20",
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: "Dibatalkan",
        color: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: XCircle,
    },
    EXPIRED: {
        label: "Kedaluwarsa",
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        icon: AlertCircle,
    },
    REFUNDED: {
        label: "Dikembalikan",
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        icon: AlertCircle,
    },
};

export default function OrdersPage() {
    const router = useRouter();
    const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
    const [snapReady, setSnapReady] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (user) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated, user, router]);

    async function fetchOrders() {
        try {
            const data = await graphqlRequest<{ userOrders: Order[] }>(
                GET_USER_ORDERS,
                { userId: user?.id }
            );
            // Sort by createdAt descending (newest first) - using parseInt for epoch timestamp strings
            const sorted = [...data.userOrders].sort(
                (a, b) => parseInt(b.createdAt, 10) - parseInt(a.createdAt, 10)
            );
            setOrders(sorted);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat pesanan");
        } finally {
            setIsLoading(false);
        }
    }

    const handlePayOrder = async (orderId: string, concertTitle: string, orderStatus: string) => {
        if (!token || !snapReady) return;

        setPayingOrderId(orderId);

        try {
            let snapToken: string;

            if (orderStatus === "AWAITING_PAYMENT") {
                // Get existing snap token for AWAITING_PAYMENT orders
                const paymentResponse = await fetch(
                    `http://localhost:4000/payments/${orderId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const paymentData = await paymentResponse.json();

                if (!paymentResponse.ok || !paymentData.data?.snapToken) {
                    // If no existing token, try to create new one by resetting order
                    throw new Error("Token pembayaran tidak ditemukan. Silakan buat order baru.");
                }

                snapToken = paymentData.data.snapToken;
            } else {
                // Create new Midtrans payment token for PENDING orders
                const paymentResponse = await fetch(
                    `http://localhost:4000/payments/${orderId}/create`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const paymentData = await paymentResponse.json();

                if (!paymentResponse.ok) {
                    throw new Error(paymentData.message || "Gagal membuat pembayaran");
                }

                snapToken = paymentData.data.token;
            }

            // Open Midtrans Snap popup
            window.snap.pay(snapToken, {
                onSuccess: async (result) => {
                    console.log("Payment success:", result);

                    // Verify payment
                    try {
                        await fetch(
                            `http://localhost:4000/payments/${orderId}/verify`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                    } catch (verifyError) {
                        console.error("Verification error:", verifyError);
                    }

                    // Refresh orders
                    fetchOrders();
                    setPayingOrderId(null);

                    // Show success message or redirect
                    router.push("/payment/success");
                },
                onPending: (result) => {
                    console.log("Payment pending:", result);
                    fetchOrders();
                    setPayingOrderId(null);
                },
                onError: (result) => {
                    console.error("Payment error:", result);
                    setPayingOrderId(null);
                    alert("Pembayaran gagal. Silakan coba lagi.");
                },
                onClose: () => {
                    console.log("Payment popup closed");
                    setPayingOrderId(null);
                },
            });
        } catch (err) {
            console.error("Payment error:", err);
            setPayingOrderId(null);
            alert(err instanceof Error ? err.message : "Gagal memproses pembayaran");
        }
    };

    if (authLoading || isLoading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Memuat riwayat pesanan...</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            {/* Midtrans Snap Script */}
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={MIDTRANS_CLIENT_KEY}
                onLoad={() => setSnapReady(true)}
            />

            <Navbar />
            <main className="min-h-screen bg-background">
                <div className="container mx-auto max-w-4xl py-8 px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold">Riwayat Pesanan</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Lihat semua riwayat pembelian tiket Anda
                        </p>
                    </div>

                    {error ? (
                        <Card className="p-8 text-center">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={fetchOrders}>Coba Lagi</Button>
                        </Card>
                    ) : orders.length === 0 ? (
                        <Card className="p-12 text-center">
                            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Belum Ada Pesanan</h3>
                            <p className="text-muted-foreground mb-6">
                                Anda belum melakukan pemesanan tiket. Jelajahi konser menarik sekarang!
                            </p>
                            <Link href="/concerts">
                                <Button>Jelajahi Konser</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const status = statusConfig[order.status] || statusConfig.PENDING;
                                const StatusIcon = status.icon;
                                const totalItems = order.orderItems.reduce((sum, item) => sum + item.qty, 0);
                                const isPaying = payingOrderId === order.id;

                                return (
                                    <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Left - Order Info */}
                                                <div className="flex-1 p-6">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground mb-1">
                                                                Order #{order.midtransOrderId}
                                                            </p>
                                                            <Badge variant="outline" className={status.color}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {status.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-muted-foreground">Total</p>
                                                            <p className="text-lg font-bold text-primary">
                                                                {formatPrice(order.grossAmount)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-lg font-semibold mb-2">{order.concert.title}</h3>

                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(order.createdAt)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <ShoppingBag className="w-4 h-4" />
                                                            <span>{totalItems} tiket</span>
                                                        </div>
                                                    </div>

                                                    {/* Order Items Preview */}
                                                    <div className="mt-3 pt-3 border-t">
                                                        <div className="flex flex-wrap gap-2">
                                                            {order.orderItems.map((item, idx) => (
                                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                                    {item.ticketType.name} × {item.qty}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right - Action */}
                                                <div className="md:w-40 p-6 bg-muted/30 border-t md:border-t-0 md:border-l flex items-center justify-center">
                                                    {order.status === "PAID" ? (
                                                        <Link href="/dashboard/tickets">
                                                            <Button variant="outline" className="w-full">
                                                                Lihat Tiket
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    ) : order.status === "PENDING" || order.status === "AWAITING_PAYMENT" ? (
                                                        <Button
                                                            variant="default"
                                                            className="w-full"
                                                            onClick={() => handlePayOrder(order.id, order.concert.title, order.status)}
                                                            disabled={isPaying || !snapReady}
                                                        >
                                                            {isPaying ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                                    Memproses...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Bayar
                                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground text-center">
                                                            Pesanan {status.label.toLowerCase()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
