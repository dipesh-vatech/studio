
'use client';

import { useState } from 'react';
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
  Check,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' },
  ];

  const features = [
    {
      title: 'Manage Your Deals From Start to Finish',
      description:
        'From initial contact to final payment, CollabFlow provides a centralized hub to keep track of every detail. Never miss a deadline or a deliverable again, ensuring professional and reliable partnerships.',
      subFeatures: [
        {
          icon: Handshake,
          title: 'Track Collaborations',
          description:
            'Seamlessly manage every stage of your brand deals, from upcoming to completed, all in one place.',
          image: { 
            src: '/deals-management.png', 
            alt: 'Deals Management Dashboard',
            hint: 'deals management' 
          },
        },
        {
          icon: FileText,
          title: 'AI Contract Analysis',
          description:
            'Instantly extract key details like payment, deliverables, and dates from contracts with our AI parser.',
          image: { 
            src: '/contract-analysis.png', 
            alt: 'AI Contract Analysis',
            hint: 'contract analysis'
          },
        },
        {
          icon: Lightbulb,
          title: 'Generate Pitches with AI',
          description:
            'Let AI craft personalized and professional pitch emails, helping you land your next big collaboration.',
          image: {
            src: '/ai-pitch-generation.png',
            alt: 'AI Pitch Generation',
            hint: 'ai pitch'
          }
        },
      ],
    },
    {
      title: 'Uncover Actionable Content Insights',
      description:
        'Go beyond surface-level numbers. Our AI-powered tools analyze your post performance, providing qualitative feedback on what worked, why it worked, and how to create even better content next time.',
      subFeatures: [
        {
          icon: BarChart,
          title: 'Deep Engagement Analytics',
          description:
            'Track your likes, comments, and shares over time with dynamic charts and discover your growth trends.',
          image: {
            src: '/content-analytics.png',
            alt: 'Content Analytics Dashboard',
            hint: 'content analytics'
          },
        },
        {
          icon: Search,
          title: 'AI Performance Review',
          description:
            'Get expert-level analysis on your posts to understand performance and receive actionable suggestions for improvement.',
          image: {
            src: '/ai-analysis.png',
            alt: 'AI Performance Analysis',
            hint: 'ai analysis'
          },
        },
        {
          icon: CalendarDays,
          title: 'AI-Powered Scheduling',
          description:
            'Visualize your content calendar and let AI generate creative post ideas and suggest the best times to engage your audience.',
          image: {
            src: '/ai-scheduling.png',
            alt: 'AI Scheduling',
            hint: 'ai scheduling'
          }
        },
      ],
    },
     {
      title: 'Master Your Financials',
      description:
        'Take control of your business with a clear financial overview. Track your earnings, monitor outstanding payments, and identify your most valuable partnerships to maximize your revenue.',
      subFeatures: [
        {
          icon: DollarSign,
          title: 'Visualize Your Revenue',
          description:
            'See income over time and identify your top-earning brand collaborations with easy-to-read charts.',
          image: {
            src: '/financial-analytics.png',
            alt: 'Financial Analytics Dashboard',
            hint: 'financial dashboard'
          },
        },
        {
            icon: Check,
            title: 'Track Payments',
            description:
                'Never lose track of an invoice. Monitor all outstanding and completed payments in one simple view.',
            image: {
                src: '/payment-tracking.png',
                alt: 'Payment Tracking',
                hint: 'payment tracking'
            }
        },
        {
            icon: Award,
            title: 'Identify Top Partners',
            description: 'Quickly see which brand collaborations are driving the most revenue for your business.',
            image: {
                src: '/partner-analytics.png',
                alt: 'Top Partners Analytics',
                hint: 'partner analytics'
            }
        }
      ],
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for creators getting started.',
      features: [
        'Up to 10 deals',
        'Manual Content Tracking',
        'Basic AI Pitch Generator',
        'Community Support',
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline',
    },
    {
      name: 'Pro',
      price: '$25',
      description: 'For professionals scaling their brand.',
      isPopular: true,
      features: [
        'Unlimited deals',
        'AI Performance Analysis',
        'AI Content Idea Generation',
        'AI Contract Analysis',
        'Financial Analytics',
        'Priority Support',
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default',
    },
  ];

  const FeatureBlock = ({ feature, index }: { feature: (typeof features)[0], index: number }) => {
    const [activeImage, setActiveImage] = useState(feature.subFeatures[0].image);

    return (
       <div
        className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16 lg:gap-24"
      >
        <div className={cn(index % 2 === 1 ? 'md:order-last' : '')}>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {feature.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {feature.description}
            </p>
            <ul className="mt-8 space-y-2">
              {feature.subFeatures.map((sub) => (
                <li key={sub.title}>
                  <button
                    onClick={() => setActiveImage(sub.image)}
                    className={cn(
                        "w-full text-left p-4 rounded-lg transition-colors",
                        activeImage.src === sub.image.src ? 'bg-primary/10' : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full shrink-0 mt-1",
                            activeImage.src === sub.image.src ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        )}>
                            <sub.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{sub.title}</h3>
                            <p className="mt-1 text-muted-foreground">
                                {sub.description}
                            </p>
                        </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[450px]">
            <Image
                src={activeImage.src}
                width={600}
                height={400}
                alt={activeImage.alt}
                className="w-full h-auto rounded-lg border bg-card object-contain shadow-lg"
                data-ai-hint={activeImage.hint}
            />
        </div>
      </div>
    );
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
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
        <section className="relative container py-20 text-center sm:py-24 md:py-32">
          <div 
            className="absolute -top-20 left-0 -z-10 h-64 w-64 bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div 
            className="absolute -bottom-20 right-0 -z-10 h-64 w-64 bg-accent/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="flex flex-col items-center">
            <Badge variant="outline" className="mb-4 text-sm font-medium border-primary/30 text-primary">
              <Award className="mr-2 h-4 w-4" />
              AI-POWERED COLLABORATION MANAGEMENT
            </Badge>
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
              src="/collabflow-Dashboard.png"
              width={1200}
              height={740}
              alt="CollabFlow App Dashboard"
              className="rounded-lg border bg-card shadow-2xl"
              priority
              data-ai-hint="dashboard product"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container space-y-16 py-16 sm:space-y-24 md:py-24">
          {features.map((feature, index) => (
             <FeatureBlock key={feature.title} feature={feature} index={index} />
          ))}
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="bg-muted/30">
        <div className="container py-16 md:py-24">
           <div className="mx-auto max-w-2xl text-center">
             <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
               Choose the Right Plan for You
             </h2>
             <p className="mt-4 text-lg text-muted-foreground">
               Simple, transparent pricing. No hidden fees.
             </p>
           </div>
           <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={cn('flex flex-col', plan.isPopular ? 'border-2 border-primary shadow-2xl' : 'shadow-lg')}>
                 <CardHeader className="text-center relative">
                    {plan.isPopular && <Badge className="absolute top-0 -translate-y-1/2">Most Popular</Badge>}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6 flex-1">
                   <div className="text-center">
                     <span className="text-4xl font-bold">{plan.price}</span>
                     <span className="text-muted-foreground">{plan.price !== '$0' && '/month'}</span>
                   </div>
                   <ul className="space-y-3">
                     {plan.features.map((feature) => (
                       <li key={feature} className="flex items-center gap-3">
                         <Check className="h-5 w-5 text-green-500" />
                         <span className="text-muted-foreground">{feature}</span>
                       </li>
                     ))}
                   </ul>
                 </CardContent>
                 <CardFooter>
                   <Button asChild className="w-full" variant={plan.buttonVariant as 'default' | 'outline'}>
                     <Link href="/signup">{plan.buttonText}</Link>
                   </Button>
                 </CardFooter>
               </Card>
            ))}
           </div>
           </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="bg-background">
          <div className="container py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Built for the Modern Creator
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                CollabFlow was born from a simple idea: to empower creators by simplifying the business of influence. We handle the administrative tasks—deal tracking, contract management, and financial oversight—so you can focus on what you do best: creating amazing content and building your community.
              </p>
               <div className="mt-8">
                 <Button size="lg" asChild>
                   <Link href="/signup">Join CollabFlow Today</Link>
                 </Button>
               </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t">
        <div className="container flex items-center justify-between py-8">
           <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CollabFlow. All rights reserved.</p>
           <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
           </nav>
        </div>
      </footer>
    </div>
  );
}
