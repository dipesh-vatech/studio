import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BriefcaseBusiness, Award, Menu } from 'lucide-react';

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
            <Image
              src="https://placehold.co/1200x740.png"
              width={1200}
              height={740}
              alt="CollabFlow App Dashboard"
              data-ai-hint="app dashboard analytics"
              className="rounded-lg border bg-card shadow-2xl"
            />
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
