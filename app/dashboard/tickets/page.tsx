"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import {
    Ticket,
    Calendar,
    MapPin,
    Loader2,
    TicketX,
    CheckCircle2,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { graphqlRequest, GET_USER_TICKETS, Ticket as TicketType } from "@/lib/graphql";
import { QRCodeSVG } from "qrcode.react";

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "-";
    try {
        // Handle epoch timestamp string (like '1753038000000')
        const timestamp = parseInt(dateString, 10);
        const date = !isNaN(timestamp) ? new Date(timestamp) : new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "-";
    }
}

function formatTime(dateString: string | null | undefined): string {
    if (!dateString) return "-";
    try {
        // Handle epoch timestamp string (like '1753038000000')
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

// Price formatting removed - not used in this component

const statusConfig = {
    ISSUED: {
        label: "Aktif",
        color: "bg-green-500/10 text-green-600 border-green-500/20",
        icon: CheckCircle2,
    },
    USED: {
        label: "Sudah Digunakan",
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        icon: TicketX,
    },
    VOID: {
        label: "Dibatalkan",
        color: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: TicketX,
    },
};

export default function MyTicketsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (user) {
            fetchTickets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated, user, router]);

    async function fetchTickets() {
        try {
            const data = await graphqlRequest<{ userTickets: TicketType[] }>(
                GET_USER_TICKETS,
                { userId: user?.id }
            );
            // Sort by issuedAt descending (newest first) - using parseInt for epoch timestamp strings
            const sorted = [...data.userTickets].sort(
                (a, b) => parseInt(b.issuedAt, 10) - parseInt(a.issuedAt, 10)
            );
            setTickets(sorted);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat tiket");
        } finally {
            setIsLoading(false);
        }
    }

    if (authLoading || isLoading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Memuat tiket...</p>
                    </div>
                </main>
            </>
        );
    }

    const activeTickets = tickets
        .filter((t) => t.status === "ISSUED")
        .sort((a, b) => parseInt(b.issuedAt, 10) - parseInt(a.issuedAt, 10));
    const usedTickets = tickets
        .filter((t) => t.status === "USED" || t.status === "VOID")
        .sort((a, b) => parseInt(b.issuedAt, 10) - parseInt(a.issuedAt, 10));

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                <div className="container mx-auto max-w-4xl py-8 px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Ticket className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold">Tiket Saya</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Kelola dan lihat semua tiket konser Anda
                        </p>
                    </div>

                    {error ? (
                        <Card className="p-8 text-center">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={fetchTickets}>Coba Lagi</Button>
                        </Card>
                    ) : tickets.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Ticket className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Belum Ada Tiket</h3>
                            <p className="text-muted-foreground mb-6">
                                Anda belum memiliki tiket konser. Jelajahi konser menarik sekarang!
                            </p>
                            <Link href="/concerts">
                                <Button>Jelajahi Konser</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            {/* Active Tickets */}
                            {activeTickets.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Tiket Aktif ({activeTickets.length})
                                    </h2>
                                    <div className="space-y-4">
                                        {activeTickets.map((ticket) => {
                                            const StatusIcon = statusConfig[ticket.status].icon;
                                            return (
                                                <Card key={ticket.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col md:flex-row">
                                                        {/* Left - Ticket Info */}
                                                        <div className="flex-1 p-6">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={statusConfig[ticket.status].color}
                                                                    >
                                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                                        {statusConfig[ticket.status].label}
                                                                    </Badge>
                                                                </div>
                                                                <Badge variant="secondary">{ticket.ticketType.name}</Badge>
                                                            </div>
                                                            <h3 className="text-xl font-bold mb-3">{ticket.concert.title}</h3>
                                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4 text-primary" />
                                                                    <span>
                                                                        {formatDate(ticket.concert.startAt)} • {formatTime(ticket.concert.startAt)} WIB
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-primary" />
                                                                    <span>{ticket.concert.venue}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right - QR Code Area */}
                                                        <div className="md:w-48 p-6 bg-muted/30 border-t md:border-t-0 md:border-l flex flex-col items-center justify-center">
                                                            <div className="w-28 h-28 bg-white rounded-lg flex items-center justify-center mb-3 border p-2">
                                                                <QRCodeSVG
                                                                    value={JSON.stringify({
                                                                        code: ticket.code,
                                                                        concert: ticket.concert.title,
                                                                        type: ticket.ticketType.name,
                                                                        venue: ticket.concert.venue,
                                                                        date: ticket.concert.startAt,
                                                                        status: ticket.status
                                                                    })}
                                                                    size={96}
                                                                    level="M"
                                                                    includeMargin={false}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground text-center font-mono">
                                                                {ticket.code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Past/Used Tickets */}
                            {usedTickets.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-muted-foreground" />
                                        Riwayat Tiket ({usedTickets.length})
                                    </h2>
                                    <div className="space-y-4 opacity-70">
                                        {usedTickets.map((ticket) => {
                                            const StatusIcon = statusConfig[ticket.status].icon;
                                            return (
                                                <Card key={ticket.id} className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={statusConfig[ticket.status].color}
                                                                >
                                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                                    {statusConfig[ticket.status].label}
                                                                </Badge>
                                                                <Badge variant="secondary">{ticket.ticketType.name}</Badge>
                                                            </div>
                                                            <h4 className="font-semibold">{ticket.concert.title}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatDate(ticket.concert.startAt)}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {ticket.code}
                                                        </p>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
