import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BriefcaseBusiness, Award, Menu } from 'lucide-react';

const DashboardPlaceholder = () => {
  const svg = `<svg width="1200" height="740" viewBox="0 0 1200 740" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="740" rx="12" fill="white"/><rect x="24" y="24" width="1152" height="64" rx="8" fill="#F3F4F6"/><rect x="48" y="44" width="150" height="16" rx="4" fill="#E5E7EB"/><rect x="1056" y="36" width="100" height="40" rx="8" fill="#E5E7EB"/><rect x="24" y="112" width="256" height="604" rx="8" fill="#F9FAFB"/><rect x="48" y="136" width="100" height="10" rx="5" fill="#D1D5DB"/><rect x="48" y="162" width="180" height="24" rx="6" fill="#E5E7EB"/><rect x="48" y="202" width="150" height="24" rx="6" fill="#E5E7EB"/><rect x="48" y="242" width="180" height="24" rx="6" fill="#E5E7EB"/><rect x="48" y="282" width="120" height="24" rx="6" fill="#E5E7EB"/><rect x="304" y="112" width="872" height="280" rx="8" fill="#F9FAFB"/><rect x="328" y="136" width="200" height="12" rx="6" fill="#D1D5DB"/><rect x="328" y="180" width="824" height="20" rx="5" fill="#E5E7EB"/><path d="M328 226H900" stroke="#E5E7EB" stroke-width="10" stroke-linecap="round"/><path d="M328 252H750" stroke="#E5E7EB" stroke-width="10" stroke-linecap="round"/><path d="M328 278H952" stroke="#E5E7EB" stroke-width="10" stroke-linecap="round"/><path d="M328 304H800" stroke="#E5E7EB" stroke-width="10" stroke-linecap="round"/><rect x="304" y="416" width="424" height="300" rx="8" fill="#F9FAFB"/><rect x="328" y="440" width="150" height="12" rx="6" fill="#D1D5DB"/><path d="M344 500L400 470L450 520L520 490L580 540L630 500L680 560L728 530" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="752" y="416" width="424" height="300" rx="8" fill="#F9FAFB"/><rect x="776" y="440" width="150" height="12" rx="6" fill="#D1D5DB"/><rect x="784" y="480" width="180" height="20" rx="4" fill="#E5E7EB"/><rect x="980" y="480" width="80" height="20" rx="4" fill="#E5E7EB"/><rect x="784" y="510" width="150" height="20" rx="4" fill="#E5E7EB"/><rect x="950" y="510" width="110" height="20" rx="4" fill="#E5E7EB"/><rect x="784" y="540" width="190" height="20" rx="4" fill="#E5E7EB"/><rect x="990" y="540" width="70" height="20" rx="4" fill="#E5E7EB"/></svg>`;
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return (
    <Image
      src={dataUri}
      width={1200}
      height={740}
      alt="CollabFlow App Dashboard"
      className="rounded-lg border bg-card shadow-2xl"
    />
  );
};

export default function LandingPage() {
  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">CollabFlow</span>
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-6 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
               <Button variant="ghost" asChild>
                 <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <div className="p-4">
                  <Link href="/" className="flex items-center space-x-2 mb-8">
                    <BriefcaseBusiness className="h-6 w-6 text-primary" />
                    <span className="font-bold">CollabFlow</span>
                  </Link>
                  <nav className="flex flex-col space-y-5">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-foreground/70 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 border-t">
                  <div className="flex flex-col gap-3">
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 text-center md:py-32 lg:py-40">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center justify-center space-x-2 rounded-full bg-secondary px-4 py-1 text-sm font-medium text-primary">
              <Award className="h-5 w-5" />
              <span>AI-POWERED COLLABORATION MANAGEMENT</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Streamline Your Creator Collaborations
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground">
              From contract parsing to AI-powered pitch emails, CollabFlow gives you the tools to manage your brand partnerships efficiently.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container pb-20 md:pb-32">
          <div className="relative mx-auto max-w-5xl">
            <DashboardPlaceholder />
            <div className="absolute -bottom-10 -left-10 -z-10 hidden md:block">
              <div className="grid grid-cols-6 gap-2">
                 {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-primary/20" />
                ))}
              </div>
            </div>
             <div className="absolute -top-10 -right-10 -z-10 hidden md:block">
              <div className="grid grid-cols-6 gap-2">
                 {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-primary/20" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
           <p>&copy; {new Date().getFullYear()} CollabFlow. All rights reserved.</p>
           <nav className="flex items-center gap-4">
              <Link href="#" className="hover:underline">Privacy</Link>
              <Link href="#" className="hover:underline">Terms</Link>
           </nav>
        </div>
      </footer>
    </div>
  );
}
