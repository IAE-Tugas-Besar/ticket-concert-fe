import {
  ShieldCheck,
  Zap,
  Users,
  Star,
  Info,
} from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: ShieldCheck,
    title: "Pembayaran 100% Aman",
    description:
      "Transaksi Anda dilindungi dengan enkripsi tingkat bank.",
  },
  {
    icon: Zap,
    title: "Tiket Instan",
    description:
      "Terima e-tiket langsung ke email & WhatsApp Anda secepat kilat.",
  },
  {
    icon: Users,
    title: "Jaminan Uang Kembali",
    description:
      "Dana kembali 100% jika event dibatalkan oleh penyelenggara.",
  },
  {
    icon: Star,
    title: "Layanan Pelanggan",
    description:
      "Tim support kami siap membantu Anda setiap hari (09.00 - 21.00 WIB).",
  },
];

const Features = () => {
  return (
    <section id="features" className="w-full py-16 lg:py-24 overflow-hidden relative">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left Side: Text & Features List */}
          <div className="flex-1 w-full text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Info className="w-4 h-4" />
              <span>Mengapa Memilih Kami?</span>
            </div>
            <h2 className="text-3xl xs:text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Platform Tiket Paling <span className="text-primary">Terpercaya</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              Kami memastikan setiap langkah pembelian tiket Anda berjalan lancar,
              dari pemilihan kursi hingga masuk ke venue konser.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col gap-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h4 className="text-xl font-semibold">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Visual / Image */}
          <div className="hidden lg:block flex-1 relative w-full h-[600px] max-w-lg mx-auto lg:max-w-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -z-10"></div>

            {/* Mockup Card 1 */}
            <div className="absolute top-0 right-10 w-72 bg-card border shadow-sm rounded-xl p-4 transform rotate-6 hover:rotate-0 transition-all duration-500 z-10">
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1974&auto=format&fit=crop"
                  fill
                  alt="Concert"
                  className="object-cover"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Sheila on 7</p>
                  <p className="text-xs text-muted-foreground">GBK, Jakarta</p>
                </div>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">VIP</span>
              </div>
            </div>

            {/* Mockup Card 2 */}
            <div className="absolute bottom-10 left-10 w-72 bg-card border shadow-sm rounded-xl p-4 transform -rotate-6 hover:rotate-0 transition-all duration-500 z-20">
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop"
                  fill
                  alt="Concert"
                  className="object-cover"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Raisa Live</p>
                  <p className="text-xs text-muted-foreground">Tennis Indoor</p>
                </div>
                <span className="text-xs font-bold bg-accent text-accent-foreground px-2 py-1 rounded-full">CAT 1</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
