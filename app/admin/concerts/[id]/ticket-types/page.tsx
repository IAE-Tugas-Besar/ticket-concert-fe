"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Plus,
    ArrowLeft,
    Edit,
    Trash2,
    Loader2,
    Ticket,
    X,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface TicketType {
    id: string;
    name: string;
    price: string;
    quotaTotal: number;
    quotaSold: number;
    salesStartAt: string;
    salesEndAt: string;
}

interface Concert {
    id: string;
    title: string;
    venue: string;
    startAt: string;
    status: string;
    ticketTypes: TicketType[];
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
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

export default function TicketTypesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const { token } = useAuth();
    const [concert, setConcert] = useState<Concert | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        quotaTotal: "",
        salesStartAt: "",
        salesEndAt: "",
    });

    const fetchConcert = async () => {
        try {
            const res = await fetch(`${API_URL}/concerts/${resolvedParams.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setConcert(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch concert:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchConcert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, resolvedParams.id]);

    const openCreateModal = () => {
        setEditingTicketType(null);
        setFormData({
            name: "",
            price: "",
            quotaTotal: "",
            salesStartAt: "",
            salesEndAt: "",
        });
        setIsModalOpen(true);
    };

    const openEditModal = (tt: TicketType) => {
        setEditingTicketType(tt);
        setFormData({
            name: tt.name,
            price: parseFloat(tt.price).toString(),
            quotaTotal: tt.quotaTotal.toString(),
            salesStartAt: tt.salesStartAt.slice(0, 16),
            salesEndAt: tt.salesEndAt.slice(0, 16),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                price: parseFloat(formData.price),
                quotaTotal: parseInt(formData.quotaTotal),
                salesStartAt: new Date(formData.salesStartAt).toISOString(),
                salesEndAt: new Date(formData.salesEndAt).toISOString(),
            };

            const url = editingTicketType
                ? `${API_URL}/concerts/${resolvedParams.id}/ticket-types/${editingTicketType.id}`
                : `${API_URL}/concerts/${resolvedParams.id}/ticket-types`;

            const res = await fetch(url, {
                method: editingTicketType ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchConcert();
            } else {
                alert(data.message || "Failed to save ticket type");
            }
        } catch (error) {
            console.error("Failed to save ticket type:", error);
            alert("Failed to save ticket type");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (ttId: string) => {
        if (!confirm("Yakin ingin menghapus tipe tiket ini?")) return;

        try {
            const res = await fetch(
                `${API_URL}/concerts/${resolvedParams.id}/ticket-types/${ttId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            if (data.success) {
                fetchConcert();
            } else {
                alert(data.message || "Failed to delete ticket type");
            }
        } catch (error) {
            console.error("Failed to delete ticket type:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!concert) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Konser tidak ditemukan</p>
                <Link href="/admin/concerts">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/admin/concerts"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Kembali ke Konser
                    </Link>
                    <h1 className="text-3xl font-bold">{concert.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        {concert.venue} • {formatDate(concert.startAt)}
                    </p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Tipe Tiket
                </Button>
            </div>

            {/* Ticket Types List */}
            {concert.ticketTypes.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Belum ada tipe tiket</p>
                        <Button className="mt-4" onClick={openCreateModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Tipe Tiket Pertama
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {concert.ticketTypes.map((tt) => (
                        <Card key={tt.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{tt.name}</CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(tt)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => handleDelete(tt.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-2xl font-bold">
                                    {formatCurrency(parseFloat(tt.price))}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Kuota</span>
                                    <Badge variant="secondary">
                                        {tt.quotaSold} / {tt.quotaTotal}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>Mulai: {formatDate(tt.salesStartAt)}</p>
                                    <p>Berakhir: {formatDate(tt.salesEndAt)}</p>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{
                                            width: `${(tt.quotaSold / tt.quotaTotal) * 100}%`,
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>
                                {editingTicketType ? "Edit Tipe Tiket" : "Tambah Tipe Tiket"}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Nama Tipe</label>
                                    <Input
                                        placeholder="VIP, Regular, dll"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Harga</label>
                                        <Input
                                            type="number"
                                            placeholder="500000"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({ ...formData, price: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Kuota</label>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            value={formData.quotaTotal}
                                            onChange={(e) =>
                                                setFormData({ ...formData, quotaTotal: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Mulai Penjualan</label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.salesStartAt}
                                        onChange={(e) =>
                                            setFormData({ ...formData, salesStartAt: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Akhir Penjualan</label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.salesEndAt}
                                        onChange={(e) =>
                                            setFormData({ ...formData, salesEndAt: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : editingTicketType ? (
                                            "Simpan"
                                        ) : (
                                            "Tambah"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
