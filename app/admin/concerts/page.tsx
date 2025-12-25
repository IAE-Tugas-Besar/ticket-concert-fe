"use client";

import { useEffect, useState } from "react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    Loader2,
    Music,
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
    endAt: string;
    description: string | null;
    imageUrl: string | null;
    status: "DRAFT" | "PUBLISHED" | "ENDED";
    ticketTypes: TicketType[];
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function ConcertsManagementPage() {
    const { token } = useAuth();
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConcert, setEditingConcert] = useState<Concert | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        venue: "",
        startAt: "",
        endAt: "",
        description: "",
        status: "DRAFT",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchConcerts = async () => {
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (searchQuery) params.append("search", searchQuery);
            if (statusFilter) params.append("status", statusFilter);

            const res = await fetch(`${API_URL}/concerts?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setConcerts(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch concerts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchConcerts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchConcerts();
    };

    const openCreateModal = () => {
        setEditingConcert(null);
        setFormData({
            title: "",
            venue: "",
            startAt: "",
            endAt: "",
            description: "",
            status: "DRAFT",
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (concert: Concert) => {
        setEditingConcert(concert);
        setFormData({
            title: concert.title,
            venue: concert.venue,
            startAt: concert.startAt.slice(0, 16),
            endAt: concert.endAt.slice(0, 16),
            description: concert.description || "",
            status: concert.status,
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formPayload = new FormData();
            formPayload.append("title", formData.title);
            formPayload.append("venue", formData.venue);
            formPayload.append("startAt", new Date(formData.startAt).toISOString());
            formPayload.append("endAt", new Date(formData.endAt).toISOString());
            formPayload.append("description", formData.description);
            formPayload.append("status", formData.status);
            if (imageFile) {
                formPayload.append("image", imageFile);
            }

            const url = editingConcert
                ? `${API_URL}/concerts/${editingConcert.id}`
                : `${API_URL}/concerts`;

            const res = await fetch(url, {
                method: editingConcert ? "PUT" : "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formPayload,
            });

            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchConcerts();
            } else {
                alert(data.message || "Failed to save concert");
            }
        } catch (error) {
            console.error("Failed to save concert:", error);
            alert("Failed to save concert");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus konser ini?")) return;

        try {
            const res = await fetch(`${API_URL}/concerts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                fetchConcerts();
            } else {
                alert(data.message || "Failed to delete concert");
            }
        } catch (error) {
            console.error("Failed to delete concert:", error);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/concerts/${id}/publish`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                fetchConcerts();
            } else {
                alert(data.message || "Failed to publish concert");
            }
        } catch (error) {
            console.error("Failed to publish concert:", error);
        }
    };

    const getLowestPrice = (concert: Concert): number => {
        if (concert.ticketTypes.length === 0) return 0;
        return Math.min(...concert.ticketTypes.map((t) => parseFloat(t.price)));
    };

    const getTotalQuota = (concert: Concert): number => {
        return concert.ticketTypes.reduce((sum, t) => sum + t.quotaTotal, 0);
    };

    const getTotalSold = (concert: Concert): number => {
        return concert.ticketTypes.reduce((sum, t) => sum + t.quotaSold, 0);
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Kelola Konser</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage concerts dan ticket types
                    </p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Konser
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari konser..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </form>
                        <div className="flex gap-2">
                            {["", "DRAFT", "PUBLISHED", "ENDED"].map((status) => (
                                <Button
                                    key={status}
                                    variant={statusFilter === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status || "All"}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Concerts List */}
            {concerts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Belum ada konser</p>
                        <Button className="mt-4" onClick={openCreateModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Konser Pertama
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {concerts.map((concert) => (
                        <Card key={concert.id}>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{concert.title}</h3>
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
                                        <p className="text-sm text-muted-foreground">
                                            {concert.venue} • {formatDate(concert.startAt)}
                                        </p>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>
                                                Harga: {formatCurrency(getLowestPrice(concert))}
                                            </span>
                                            <span>
                                                Terjual: {getTotalSold(concert)}/{getTotalQuota(concert)}
                                            </span>
                                            <span>
                                                Tipe Tiket: {concert.ticketTypes.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/admin/concerts/${concert.id}/ticket-types`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-1" />
                                                Ticket Types
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditModal(concert)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {concert.status === "DRAFT" && (
                                                    <DropdownMenuItem
                                                        onClick={() => handlePublish(concert.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Publish
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(concert.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>
                                {editingConcert ? "Edit Konser" : "Tambah Konser"}
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
                                    <label className="text-sm font-medium">Judul Konser</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Venue</label>
                                    <Input
                                        value={formData.venue}
                                        onChange={(e) =>
                                            setFormData({ ...formData, venue: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Mulai</label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.startAt}
                                            onChange={(e) =>
                                                setFormData({ ...formData, startAt: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Selesai</label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.endAt}
                                            onChange={(e) =>
                                                setFormData({ ...formData, endAt: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Deskripsi</label>
                                    <textarea
                                        className="w-full min-h-[100px] rounded-md border bg-transparent px-3 py-2 text-sm"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Gambar</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
                                        ) : editingConcert ? (
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
