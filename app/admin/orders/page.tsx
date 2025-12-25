"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Search,
    Loader2,
    ShoppingBag,
    Eye,
    X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface OrderItem {
    id: string;
    qty: number;
    unitPrice: string;
    subtotal: string;
    ticketType: {
        name: string;
    };
}

interface Order {
    id: string;
    midtransOrderId: string;
    status: "PENDING" | "AWAITING_PAYMENT" | "PAID" | "CANCELLED" | "EXPIRED" | "REFUNDED";
    grossAmount: string;
    createdAt: string;
    expiresAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    concert: {
        id: string;
        title: string;
    };
    orderItems: OrderItem[];
    payment?: {
        status: string;
        transactionStatus: string;
    };
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

function getStatusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "PAID":
            return "default";
        case "PENDING":
        case "AWAITING_PAYMENT":
            return "secondary";
        case "CANCELLED":
        case "EXPIRED":
            return "destructive";
        default:
            return "outline";
    }
}

export default function OrdersManagementPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            // Using GraphQL to get all orders (admin access)
            const query = `
                query {
                    orders {
                        id
                        midtransOrderId
                        status
                        grossAmount
                        createdAt
                        expiresAt
                        user {
                            id
                            name
                            email
                        }
                        concert {
                            id
                            title
                        }
                        orderItems {
                            id
                            qty
                            unitPrice
                            subtotal
                            ticketType {
                                name
                            }
                        }
                        payment {
                            status
                            transactionStatus
                        }
                    }
                }
            `;

            const res = await fetch(`${API_URL}/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query }),
            });

            const data = await res.json();
            if (data.data?.orders) {
                setOrders(data.data.orders);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            !searchQuery ||
            order.midtransOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.concert.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !statusFilter || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
            <div>
                <h1 className="text-3xl font-bold">Kelola Orders</h1>
                <p className="text-muted-foreground mt-1">
                    Lihat semua pesanan dari customer
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari order ID, nama, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {["", "PENDING", "AWAITING_PAYMENT", "PAID", "CANCELLED", "EXPIRED"].map((status) => (
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

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Belum ada order</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <Card key={order.id}>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                                                {order.midtransOrderId}
                                            </code>
                                            <Badge variant={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {order.concert.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.user.name} ({order.user.email})
                                        </p>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>{formatDate(order.createdAt)}</span>
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(parseFloat(order.grossAmount))}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Detail
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Detail Order</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedOrder(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Order ID</p>
                                <code className="text-sm font-mono">
                                    {selectedOrder.midtransOrderId}
                                </code>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={getStatusColor(selectedOrder.status)}>
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="font-medium">
                                        {formatCurrency(parseFloat(selectedOrder.grossAmount))}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Konser</p>
                                <p className="font-medium">{selectedOrder.concert.title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="font-medium">{selectedOrder.user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedOrder.user.email}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.orderItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-sm bg-muted p-2 rounded"
                                        >
                                            <span>
                                                {item.ticketType.name} x{item.qty}
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(parseFloat(item.subtotal))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Dibuat</p>
                                    <p>{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Expired</p>
                                    <p>{formatDate(selectedOrder.expiresAt)}</p>
                                </div>
                            </div>
                            {selectedOrder.payment && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Status</p>
                                    <Badge variant="outline">
                                        {selectedOrder.payment.transactionStatus || selectedOrder.payment.status}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
