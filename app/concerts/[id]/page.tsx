"use client";

import { useState, useEffect, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import {
    Calendar,
    MapPin,
    Clock,
    Ticket,
    Users,
    Loader2,
    ArrowLeft,
    Minus,
    Plus,
    ShoppingCart,
    Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { graphqlRequest, GET_CONCERT_BY_ID, Concert, TicketType } from "@/lib/graphql";
import { useAuth } from "@/lib/auth-context";

// Placeholder images
const concertImages = [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=2070&auto=format&fit=crop",
];

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "-";
    try {
        const timestamp = parseInt(dateString, 10);
        const date = !isNaN(timestamp) ? new Date(timestamp) : new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return "-";
    }
}

function formatTime(dateString: string | null | undefined): string {
    if (!dateString) return "-";
    try {
        const timestamp = parseInt(dateString, 10);
        const date = !isNaN(timestamp) ? new Date(timestamp) : new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleTimeString("id-ID", {
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

interface TicketSelection {
    ticketTypeId: string;
    quantity: number;
    price: number;
    name: string;
}

export default function ConcertDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [concert, setConcert] = useState<Concert | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selections, setSelections] = useState<TicketSelection[]>([]);

    useEffect(() => {
        async function fetchConcert() {
            try {
                const data = await graphqlRequest<{ concert: Concert }>(GET_CONCERT_BY_ID, { id });
                if (!data.concert) {
                    setError("Konser tidak ditemukan");
                } else {
                    setConcert(data.concert);
                    // Initialize selections
                    setSelections(
                        data.concert.ticketTypes.map((tt) => ({
                            ticketTypeId: tt.id,
                            quantity: 0,
                            price: tt.price,
                            name: tt.name,
                        }))
                    );
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Gagal memuat konser");
            } finally {
                setIsLoading(false);
            }
        }

        fetchConcert();
    }, [id]);

    const updateQuantity = (ticketTypeId: string, delta: number, maxQty: number) => {
        setSelections((prev) =>
            prev.map((s) => {
                if (s.ticketTypeId === ticketTypeId) {
                    const newQty = Math.max(0, Math.min(maxQty, s.quantity + delta));
                    return { ...s, quantity: newQty };
                }
                return s;
            })
        );
    };

    const getTotalItems = () => selections.reduce((sum, s) => sum + s.quantity, 0);
    const getTotalPrice = () => selections.reduce((sum, s) => sum + s.quantity * s.price, 0);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Store selection in localStorage for checkout page
        const orderData = {
            concertId: id,
            concertTitle: concert?.title,
            items: selections.filter((s) => s.quantity > 0),
            totalPrice: getTotalPrice(),
        };
        localStorage.setItem("pendingOrder", JSON.stringify(orderData));
        router.push("/checkout");
    };

    const getAvailableQuota = (tt: TicketType) => tt.quotaTotal - tt.quotaSold;

    if (isLoading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Memuat detail konser...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error || !concert) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl font-medium mb-2">Konser Tidak Ditemukan</p>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Link href="/concerts">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Daftar Konser
                            </Button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Hero Image */}
                <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                    <Image
                        src={concertImages[0]}
                        alt={concert.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="container mx-auto max-w-6xl">
                            <Link
                                href="/concerts"
                                className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Daftar Konser
                            </Link>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                                {concert.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto max-w-6xl py-8 px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Info Cards */}
                            <div className="space-y-4">
                                {/* Date and Time Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Card className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                                <Calendar className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Tanggal</p>
                                                <p className="font-semibold">{formatDate(concert.startAt)}</p>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Waktu</p>
                                                <p className="font-semibold">{formatTime(concert.startAt)} WIB</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Location - Full Width */}
                                <Card className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Lokasi</p>
                                            <p className="font-semibold">{concert.venue}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="w-5 h-5" />
                                        Tentang Event
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {concert.description || "Deskripsi event akan segera tersedia."}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Ticket Types */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Ticket className="w-5 h-5" />
                                        Pilih Tiket
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {concert.ticketTypes.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            Tiket belum tersedia untuk event ini.
                                        </p>
                                    ) : (
                                        concert.ticketTypes.map((tt) => {
                                            const available = getAvailableQuota(tt);
                                            const selection = selections.find((s) => s.ticketTypeId === tt.id);
                                            const isSoldOut = available === 0;

                                            return (
                                                <div
                                                    key={tt.id}
                                                    className={`p-4 border rounded-lg ${isSoldOut ? "opacity-50 bg-muted" : "hover:border-primary"
                                                        } transition-colors`}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold text-lg">{tt.name}</h4>
                                                                {isSoldOut && (
                                                                    <Badge variant="destructive">Habis</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-2xl font-bold text-primary">
                                                                {formatPrice(tt.price)}
                                                            </p>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                                <Users className="w-4 h-4" />
                                                                <span>{available} tiket tersisa</span>
                                                            </div>
                                                        </div>

                                                        {!isSoldOut && (
                                                            <div className="flex items-center gap-3">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => updateQuantity(tt.id, -1, available)}
                                                                    disabled={selection?.quantity === 0}
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <span className="w-8 text-center font-semibold">
                                                                    {selection?.quantity || 0}
                                                                </span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => updateQuantity(tt.id, 1, available)}
                                                                    disabled={selection?.quantity === available}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5" />
                                        Ringkasan Pesanan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {getTotalItems() === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            Pilih tiket yang ingin dibeli
                                        </p>
                                    ) : (
                                        <>
                                            <div className="space-y-3">
                                                {selections
                                                    .filter((s) => s.quantity > 0)
                                                    .map((s) => (
                                                        <div key={s.ticketTypeId} className="flex justify-between text-sm">
                                                            <span>
                                                                {s.name} x{s.quantity}
                                                            </span>
                                                            <span className="font-medium">
                                                                {formatPrice(s.quantity * s.price)}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className="border-t pt-4">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">Total</span>
                                                    <span className="text-xl font-bold text-primary">
                                                        {formatPrice(getTotalPrice())}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <Button
                                        className="w-full h-12 text-base"
                                        disabled={getTotalItems() === 0}
                                        onClick={handleCheckout}
                                    >
                                        {isAuthenticated ? (
                                            <>
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Lanjut ke Pembayaran
                                            </>
                                        ) : (
                                            <>Masuk untuk Membeli</>
                                        )}
                                    </Button>

                                    {!isAuthenticated && getTotalItems() > 0 && (
                                        <p className="text-xs text-center text-muted-foreground">
                                            Anda perlu login terlebih dahulu untuk melanjutkan pembelian
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
