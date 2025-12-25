"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Calendar, MapPin, Search, Loader2, Music, Filter, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { graphqlRequest, GET_PUBLISHED_CONCERTS, Concert } from "@/lib/graphql";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Placeholder images for concerts
const concertImages = [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506157786151-b8491531f436?q=80&w=2070&auto=format&fit=crop",
];

// Price range options
const priceRanges = [
    { id: "under500k", label: "< Rp 500.000", min: 0, max: 500000 },
    { id: "500k-1m", label: "Rp 500.000 - 1.000.000", min: 500000, max: 1000000 },
    { id: "above1m", label: "> Rp 1.000.000", min: 1000000, max: Infinity },
];

// Sort options
type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "name-az" | "name-za";

const sortOptions = [
    { id: "newest" as SortOption, label: "Terbaru" },
    { id: "oldest" as SortOption, label: "Terlama" },
    { id: "price-low" as SortOption, label: "Harga Terendah" },
    { id: "price-high" as SortOption, label: "Harga Tertinggi" },
    { id: "name-az" as SortOption, label: "Nama A-Z" },
    { id: "name-za" as SortOption, label: "Nama Z-A" },
];

function getImageForConcert(index: number): string {
    return concertImages[index % concertImages.length];
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "-";
    try {
        const timestamp = parseInt(dateString, 10);
        const date = !isNaN(timestamp) ? new Date(timestamp) : new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
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

// Wrapper component with Suspense for useSearchParams
export default function ConcertsPage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Memuat konser...</p>
                    </div>
                </main>
            </>
        }>
            <ConcertsPageContent />
        </Suspense>
    );
}

function ConcertsPageContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";

    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    // Filter states
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
    const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    useEffect(() => {
        async function fetchConcerts() {
            try {
                const data = await graphqlRequest<{ publishedConcerts: Concert[] }>(
                    GET_PUBLISHED_CONCERTS
                );
                setConcerts(data.publishedConcerts);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Gagal memuat konser");
            } finally {
                setIsLoading(false);
            }
        }

        fetchConcerts();
    }, []);

    // Get unique venues from concerts
    const uniqueVenues = useMemo(() => {
        const venues = concerts.map((c) => c.venue);
        return [...new Set(venues)].sort();
    }, [concerts]);

    // Get lowest price of a concert
    const getLowestPrice = (concert: Concert): number => {
        if (!concert.ticketTypes || concert.ticketTypes.length === 0) return 0;
        return Math.min(...concert.ticketTypes.map((t) => t.price));
    };

    // Filter and sort concerts
    const filteredConcerts = useMemo(() => {
        let result = [...concerts];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (concert) =>
                    concert.title.toLowerCase().includes(query) ||
                    concert.venue.toLowerCase().includes(query)
            );
        }

        // Price range filter
        if (selectedPriceRanges.length > 0) {
            result = result.filter((concert) => {
                const lowestPrice = getLowestPrice(concert);
                return selectedPriceRanges.some((rangeId) => {
                    const range = priceRanges.find((r) => r.id === rangeId);
                    if (!range) return false;
                    return lowestPrice >= range.min && lowestPrice < range.max;
                });
            });
        }

        // Venue filter
        if (selectedVenues.length > 0) {
            result = result.filter((concert) => selectedVenues.includes(concert.venue));
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return parseInt(b.startAt, 10) - parseInt(a.startAt, 10);
                case "oldest":
                    return parseInt(a.startAt, 10) - parseInt(b.startAt, 10);
                case "price-low":
                    return getLowestPrice(a) - getLowestPrice(b);
                case "price-high":
                    return getLowestPrice(b) - getLowestPrice(a);
                case "name-az":
                    return a.title.localeCompare(b.title);
                case "name-za":
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        return result;
    }, [concerts, searchQuery, selectedPriceRanges, selectedVenues, sortBy]);

    const getTotalQuota = (concert: Concert): number => {
        if (!concert.ticketTypes) return 0;
        return concert.ticketTypes.reduce((sum, t) => sum + t.quotaTotal - t.quotaSold, 0);
    };

    const togglePriceRange = (rangeId: string) => {
        setSelectedPriceRanges((prev) =>
            prev.includes(rangeId)
                ? prev.filter((id) => id !== rangeId)
                : [...prev, rangeId]
        );
    };

    const toggleVenue = (venue: string) => {
        setSelectedVenues((prev) =>
            prev.includes(venue)
                ? prev.filter((v) => v !== venue)
                : [...prev, venue]
        );
    };

    const clearFilters = () => {
        setSelectedPriceRanges([]);
        setSelectedVenues([]);
        setSortBy("newest");
        setSearchQuery("");
    };

    const hasActiveFilters = selectedPriceRanges.length > 0 || selectedVenues.length > 0 || searchQuery.trim() !== "";

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Header Section */}
                <div className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 px-6">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                    </div>
                    <div className="relative container mx-auto max-w-6xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Music className="w-6 h-6 text-primary" />
                            </div>
                            <Badge variant="secondary">Semua Event</Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Temukan Konser Impianmu
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                            Jelajahi ratusan konser dari artis favorit. Dapatkan tiket terbaik dengan
                            harga terjangkau.
                        </p>

                        {/* Search Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Cari konser atau venue..."
                                    className="pl-12 h-12 text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Filter Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-12 px-6">
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filter
                                        {hasActiveFilters && (
                                            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                                {selectedPriceRanges.length + selectedVenues.length}
                                            </Badge>
                                        )}
                                        <ChevronDown className="w-4 h-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
                                    {sortOptions.map((option) => (
                                        <DropdownMenuCheckboxItem
                                            key={option.id}
                                            checked={sortBy === option.id}
                                            onCheckedChange={() => setSortBy(option.id)}
                                        >
                                            {option.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Rentang Harga</DropdownMenuLabel>
                                    {priceRanges.map((range) => (
                                        <DropdownMenuCheckboxItem
                                            key={range.id}
                                            checked={selectedPriceRanges.includes(range.id)}
                                            onCheckedChange={() => togglePriceRange(range.id)}
                                        >
                                            {range.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}

                                    {uniqueVenues.length > 0 && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Lokasi</DropdownMenuLabel>
                                            {uniqueVenues.slice(0, 5).map((venue) => (
                                                <DropdownMenuCheckboxItem
                                                    key={venue}
                                                    checked={selectedVenues.includes(venue)}
                                                    onCheckedChange={() => toggleVenue(venue)}
                                                >
                                                    {venue}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Active Filters */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className="text-sm text-muted-foreground">Filter aktif:</span>
                                {searchQuery && (
                                    <Badge variant="secondary" className="gap-1">
                                        Cari: {searchQuery}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => setSearchQuery("")}
                                        />
                                    </Badge>
                                )}
                                {selectedPriceRanges.map((rangeId) => {
                                    const range = priceRanges.find((r) => r.id === rangeId);
                                    return range ? (
                                        <Badge key={rangeId} variant="secondary" className="gap-1">
                                            {range.label}
                                            <X
                                                className="w-3 h-3 cursor-pointer"
                                                onClick={() => togglePriceRange(rangeId)}
                                            />
                                        </Badge>
                                    ) : null;
                                })}
                                {selectedVenues.map((venue) => (
                                    <Badge key={venue} variant="secondary" className="gap-1">
                                        {venue}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => toggleVenue(venue)}
                                        />
                                    </Badge>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={clearFilters}
                                >
                                    Hapus semua
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Concerts Grid */}
                <div className="container mx-auto max-w-6xl py-12 px-6">
                    {/* Results count */}
                    {!isLoading && !error && (
                        <p className="text-muted-foreground mb-6">
                            Menampilkan {filteredConcerts.length} dari {concerts.length} konser
                        </p>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Memuat konser...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="text-destructive text-center">
                                <p className="text-lg font-medium mb-2">Terjadi Kesalahan</p>
                                <p className="text-muted-foreground">{error}</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => window.location.reload()}
                                >
                                    Coba Lagi
                                </Button>
                            </div>
                        </div>
                    ) : filteredConcerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Music className="w-16 h-16 text-muted-foreground/50 mb-4" />
                            <p className="text-lg font-medium mb-2">Tidak Ada Konser Ditemukan</p>
                            <p className="text-muted-foreground mb-4">
                                Coba ubah filter atau kata kunci pencarian
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Hapus Filter
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredConcerts.map((concert, index) => {
                                const lowestPrice = getLowestPrice(concert);
                                const totalQuota = getTotalQuota(concert);
                                const isAlmostSoldOut = totalQuota > 0 && totalQuota < 50;

                                return (
                                    <Link key={concert.id} href={`/concerts/${concert.id}`}>
                                        <Card className="group relative overflow-hidden border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                                            <div className="relative aspect-[16/9] overflow-hidden">
                                                <Image
                                                    src={getImageForConcert(index)}
                                                    alt={concert.title}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <Badge
                                                    variant="secondary"
                                                    className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90"
                                                >
                                                    Tersedia
                                                </Badge>
                                                {isAlmostSoldOut && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="absolute top-3 right-3 shadow-md"
                                                    >
                                                        Hampir Habis
                                                    </Badge>
                                                )}
                                            </div>

                                            <CardHeader className="p-4 pb-2">
                                                <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                                    {concert.title}
                                                </h3>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-1 space-y-2">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                                    {formatDate(concert.startAt)}
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                                                    {concert.venue}
                                                </div>
                                                {lowestPrice > 0 && (
                                                    <div className="flex items-center font-semibold text-lg mt-2 text-primary">
                                                        Mulai {formatPrice(lowestPrice)}
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0">
                                                <Button className="w-full rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                    Beli Tiket
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </Link>
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
