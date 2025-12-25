"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Search,
    Loader2,
    Ticket,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    Music,
    Calendar,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface TicketData {
    id: string;
    code: string;
    status: "ISSUED" | "USED" | "VOID";
    issuedAt: string;
    usedAt: string | null;
    concert: {
        title: string;
        venue: string;
        startAt: string;
    };
    ticketType: {
        name: string;
        price: string;
    };
    user: {
        name: string;
        email: string;
    };
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function TicketValidationPage() {
    const { token } = useAuth();
    const [ticketCode, setTicketCode] = useState("");
    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketCode.trim()) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setTicketData(null);

        try {
            const res = await fetch(`${API_URL}/tickets/${ticketCode}/validate`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.success) {
                setTicketData(data.data);
            } else {
                setError(data.message || "Tiket tidak ditemukan");
            }
        } catch (err) {
            setError("Gagal memvalidasi tiket");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseTicket = async () => {
        if (!ticketData) return;

        setIsScanning(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`${API_URL}/tickets/${ticketData.code}/use`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.success) {
                setSuccess("Tiket berhasil digunakan!");
                setTicketData({
                    ...ticketData,
                    status: "USED",
                    usedAt: new Date().toISOString(),
                });
            } else {
                setError(data.message || "Gagal menggunakan tiket");
            }
        } catch (err) {
            setError("Gagal menggunakan tiket");
            console.error(err);
        } finally {
            setIsScanning(false);
        }
    };

    const handleReset = () => {
        setTicketCode("");
        setTicketData(null);
        setError(null);
        setSuccess(null);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ISSUED":
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case "USED":
                return <AlertCircle className="h-6 w-6 text-yellow-500" />;
            case "VOID":
                return <XCircle className="h-6 w-6 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string): "default" | "secondary" | "destructive" => {
        switch (status) {
            case "ISSUED":
                return "default";
            case "USED":
                return "secondary";
            case "VOID":
                return "destructive";
            default:
                return "secondary";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Validasi Tiket</h1>
                <p className="text-muted-foreground mt-1">
                    Scan atau input kode tiket untuk validasi masuk
                </p>
            </div>

            {/* Search Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Input Kode Tiket</CardTitle>
                    <CardDescription>
                        Masukkan kode tiket untuk memvalidasi dan menandai sebagai USED
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleValidate} className="flex gap-3">
                        <div className="relative flex-1">
                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Masukkan kode tiket..."
                                value={ticketCode}
                                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                                className="pl-10 font-mono"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || !ticketCode.trim()}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Search className="h-4 w-4 mr-2" />
                                    Validasi
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-3 text-destructive">
                            <XCircle className="h-6 w-6" />
                            <div>
                                <p className="font-medium">Validasi Gagal</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Success Message */}
            {success && (
                <Card className="border-green-500">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-3 text-green-600">
                            <CheckCircle className="h-6 w-6" />
                            <div>
                                <p className="font-medium">{success}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ticket Result */}
            {ticketData && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(ticketData.status)}
                                <div>
                                    <CardTitle className="text-lg">
                                        Tiket Ditemukan
                                    </CardTitle>
                                    <code className="text-sm font-mono text-muted-foreground">
                                        {ticketData.code}
                                    </code>
                                </div>
                            </div>
                            <Badge variant={getStatusColor(ticketData.status)} className="text-base px-4 py-1">
                                {ticketData.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Concert Info */}
                        <div className="flex items-start gap-3">
                            <Music className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">{ticketData.concert.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {ticketData.concert.venue}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(ticketData.concert.startAt)}
                                </p>
                            </div>
                        </div>

                        {/* Ticket Type */}
                        <div className="flex items-start gap-3">
                            <Ticket className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">{ticketData.ticketType.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatCurrency(parseFloat(ticketData.ticketType.price))}
                                </p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">{ticketData.user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {ticketData.user.email}
                                </p>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                                <p>
                                    <span className="text-muted-foreground">Diterbitkan: </span>
                                    {formatDate(ticketData.issuedAt)}
                                </p>
                                {ticketData.usedAt && (
                                    <p>
                                        <span className="text-muted-foreground">Digunakan: </span>
                                        {formatDate(ticketData.usedAt)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                            {ticketData.status === "ISSUED" ? (
                                <Button
                                    className="flex-1"
                                    size="lg"
                                    onClick={handleUseTicket}
                                    disabled={isScanning}
                                >
                                    {isScanning ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Gunakan Tiket
                                </Button>
                            ) : (
                                <div className="flex-1 text-center py-3 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        {ticketData.status === "USED"
                                            ? "Tiket sudah digunakan"
                                            : "Tiket tidak valid"}
                                    </p>
                                </div>
                            )}
                            <Button variant="outline" size="lg" onClick={handleReset}>
                                Scan Lagi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Instructions */}
            {!ticketData && !error && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Siap Memvalidasi</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Masukkan kode tiket di atas untuk memulai validasi.
                            Tiket yang valid dapat langsung ditandai sebagai USED.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
