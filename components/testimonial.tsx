"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
// Badge import removed - not used
import { Star, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rizky Ramadhan",
    username: "@rizkyrama",
    event: "Sheila on 7 - Tunggu Aku Di...",
    date: "2 hari yang lalu",
    testimonial:
      "Gokil banget! Booking tiketnya gampang, gak pake ribet antri online. Pas masuk venue juga cepet scan-nya. Konser terbaik tahun ini!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Wijaya",
    username: "@sarah.w",
    event: "Java Jazz Festival 2024",
    date: "1 minggu yang lalu",
    testimonial:
      "Pengalaman VIP-nya worth it banget. Dapet akses fast track, lounge nyaman, dan view panggung yang oke parah. Bakal beli di concertticketing lagi.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    id: 3,
    name: "Andi Saputra",
    username: "@andisaputra",
    event: "Dewa 19 - Pesta Rakyat",
    date: "3 minggu yang lalu",
    testimonial:
      "Awalnya ragu takut tiket palsu, tapi ternyata aman banget. Customer service juga responsif pas aku tanya soal penukaran tiket. Mantap!",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    rating: 4,
  },
];

const Testimonial = () => {
  return (
    <section
      id="testimonials"
      className="w-full py-16 xs:py-24 bg-accent/5"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl xs:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Apa Kata <span className="text-primary">Fans?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Bergabunglah dengan ribuan penggemar musik yang telah menemukan pengalaman konser terbaik mereka bersama kami.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium bg-background border px-4 py-2 rounded-full shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
              ))}
            </div>
            <span>4.9/5 Rating dari 10k+ Ulasan</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <Card
              key={item.id}
              className="border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-background flex flex-col h-full"
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Avatar className="w-10 h-10 border">
                  <AvatarImage src={item.avatar} alt={item.name} />
                  <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-base leading-none flex items-center gap-1">
                        {item.name}
                        <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/10" />
                      </h4>
                      <span className="text-xs text-muted-foreground">{item.username}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < item.rating
                        ? "fill-orange-400 text-orange-400"
                        : "fill-muted text-muted"
                        }`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed text-foreground/80">
                  &ldquo;{item.testimonial}&rdquo;
                </p>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6">
                <div className="w-full flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Event</span>
                    <span className="text-xs font-medium text-primary truncate max-w-[140px]">{item.event}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{item.date}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
