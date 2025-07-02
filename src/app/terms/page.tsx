import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BriefcaseBusiness, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">CollabFlow</span>
          </Link>
          <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 py-12 md:py-24">
        <div className="container">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
              <CardDescription>Last updated: July 3, 2024</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-6">
              <p>
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the CollabFlow application (the "Service") operated by us.
              </p>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">1. Agreement to Terms</h2>
                <p>
                  By using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">2. Accounts</h2>
                <p>
                  When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">3. Content</h2>
                <p>
                  Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">4. Termination</h2>
                <p>
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">5. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of the jurisdiction, without regard to its conflict of law provisions.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at support@collabflow.example.com.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
