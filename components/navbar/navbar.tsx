"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Ticket, ChevronDown, LayoutDashboard, ShoppingBag, Settings } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import ThemeToggle from "../theme-toggle";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    // Redirect to landing page after logout
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 h-16 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="h-full flex items-center justify-between container mx-auto px-4 sm:px-6">
        <Logo />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <NavMenu />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 pr-3"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate font-medium">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </Button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-card border rounded-xl shadow-xl py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b bg-accent/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard/tickets"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Ticket className="w-4 h-4 text-primary" />
                        <span>Tiket Saya</span>
                      </Link>
                      <Link
                        href="/dashboard/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        <span>Riwayat Pesanan</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>Profil Saya</span>
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-primary" />
                        <span>Pengaturan</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
