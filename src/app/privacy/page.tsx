import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BriefcaseBusiness, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <CardDescription>Last updated: July 3, 2024</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-6">
              <p>
                Welcome to CollabFlow. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
              </p>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
                <p>
                  We may collect personal information that you provide to us directly, such as your name, email address, and profile information when you register for an account. We also collect data related to your use of our services, such as deals, contracts, and performance metrics you input into the application.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide, operate, and maintain our services.</li>
                  <li>Improve, personalize, and expand our services.</li>
                  <li>Understand and analyze how you use our services.</li>
                  <li>Develop new products, services, features, and functionality.</li>
                  <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the web app, and for marketing and promotional purposes.</li>
                  <li>Process your transactions and manage your orders.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">3. Sharing Your Information</h2>
                <p>
                  We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
                <p>
                  We have implemented a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">5. Your Data Rights</h2>
                <p>
                  You have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your Personal Data directly within your account settings section.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at support@collabflow.example.com.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
