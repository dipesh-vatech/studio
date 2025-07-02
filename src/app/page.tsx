import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  BriefcaseBusiness,
  Award,
  Menu,
  Handshake,
  FileText,
  Lightbulb,
  BarChart,
  DollarSign,
  CalendarDays,
} from 'lucide-react';

export default function LandingPage() {
  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' },
  ];

  const features = [
    {
      title: 'Manage Your Deals Seamlessly',
      description:
        'From initial contact to final payment, keep track of every detail of your collaborations. Never miss a deadline or a deliverable.',
      images: [
        {
          src: 'https://placehold.co/600x400.png',
          hint: 'collaboration management',
        },
        {
          src: 'https://placehold.co/600x400.png',
          hint: 'contract analysis',
        },
        {
          src: 'https://placehold.co/600x400.png',
          hint: 'email pitch',
        },
      ],
      subFeatures: [
        {
          icon: Handshake,
          title: 'Track Collaborations',
          description:
            'Manage all your brand deals, view their status, and see key details at a glance.',
        },
        {
          icon: FileText,
          title: 'AI Contract Analysis',
          description:
            'Automatically extract key details from uploaded contracts to save time and reduce errors.',
        },
        {
          icon: Lightbulb,
          title: 'Generate Pitches',
          description:
            'Craft perfect, AI-powered pitch emails to send to brands for new opportunities.',
        },
      ],
    },
    {
      title: 'Get Powerful, Reliable Metrics',
      description:
        'Measure brand awareness and presence. Track reach and engagement using our state-of-the-art technology and AI-powered insights.',
      images: [
        { src: 'https://placehold.co/600x400.png', hint: 'performance tracking' },
        { src: 'https://placehold.co/600x400.png', hint: 'financial analytics' },
        { src: 'https://placehold.co/600x400.png', hint: 'content calendar' },
      ],
      subFeatures: [
        {
          icon: BarChart,
          title: 'Track Performance',
          description:
            'Import post data to see how your content is performing across platforms.',
        },
        {
          icon: DollarSign,
          title: 'Analyze Financials',
          description:
            'Get a clear overview of your revenue, outstanding payments, and top-earning brand deals.',
        },
        {
          icon: CalendarDays,
          title: 'Visualize Your Schedule',
          description:
            'See all your deadlines and deliverables on a content calendar to stay organized.',
        },
      ],
    },
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
              src="/Dashboard.png"
              width={1200}
              height={740}
              alt="CollabFlow App Dashboard"
              className="rounded-lg border bg-card shadow-2xl mx-auto"
              data-ai-hint="dashboard app"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container space-y-24 py-16 md:space-y-32 md:py-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="grid items-center gap-12 md:grid-cols-2 md:gap-20"
            >
              <div className={index % 2 === 1 ? 'md:order-last' : ''}>
                <div className="max-w-md">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {feature.title}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {feature.description}
                  </p>
                  <ul className="mt-8 space-y-6">
                    {feature.subFeatures.map((sub) => (
                      <li key={sub.title} className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                          <sub.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{sub.title}</h3>
                          <p className="mt-1 text-muted-foreground">
                            {sub.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                     <Button size="lg" asChild>
                       <Link href="/signup">Sign Up Free</Link>
                     </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {feature.images.map((image, imgIndex) => (
                  <Image
                    key={imgIndex}
                    src={image.src}
                    width={600}
                    height={400}
                    alt={`${feature.title} - example ${imgIndex + 1}`}
                    className="rounded-lg border bg-card shadow-lg object-cover aspect-video"
                    data-ai-hint={image.hint}
                  />
                ))}
              </div>
            </div>
          ))}
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
