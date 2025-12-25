import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const footerSections = [
  {
    title: "Navigasi",
    links: [
      { title: "Beranda", href: "/" },
      { title: "Jelajahi Konser", href: "/concerts" },
      { title: "Login", href: "/login" },
      { title: "Daftar", href: "/register" },
    ],
  },
  {
    title: "Akun Saya",
    links: [
      { title: "Profil Saya", href: "/dashboard" },
      { title: "Tiket Saya", href: "/dashboard/tickets" },
      { title: "Riwayat Pesanan", href: "/dashboard/orders" },
      { title: "Pengaturan", href: "/dashboard/settings" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="mt-16 bg-card border-t pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:max-w-md">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-1.5 rounded-lg">
                <Ticket className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">ConcertTicketing</span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-sm">
              Platform pembelian tiket konser terpercaya no. 1 di Indonesia.
              Nikmati kemudahan akses ke berbagai event musik spektakuler dengan transaksi aman dan cepat.
            </p>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@concertticketing.id</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>(021) 500-123</span>
              </div>
            </div>
          </div>

          {/* Links Columns - Right Aligned */}
          <div className="flex flex-wrap gap-12 lg:gap-16">
            {footerSections.map((section) => (
              <div key={section.title} className="text-left lg:text-left">
                <h3 className="font-bold text-lg mb-6 text-foreground">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} ConcertTicketing Indonesia. All rights reserved.
          </p>


        </div>
      </div>
    </footer>
  );
};



export default Footer;
