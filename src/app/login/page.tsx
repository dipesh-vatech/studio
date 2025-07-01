'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BriefcaseBusiness, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.182C34.858 5.733 29.822 3.5 24 3.5 13.722 3.5 5.5 11.722 5.5 22s8.222 18.5 18.5 18.5S42.5 32.278 42.5 22c0-1.22-.112-2.39-.323-3.518l.434.001z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039L38.802 9.182C34.858 5.733 29.822 3.5 24 3.5 16.586 3.5 10.033 7.641 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44.5c5.943 0 11.045-2.213 14.707-5.892l-6.571-4.819c-2.115 1.4-4.817 2.213-8.136 2.213-5.225 0-9.695-3.09-11.303-7.587l-6.723 5.213C9.743 39.434 16.275 44.5 24 44.5z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.082 5.591l6.571 4.819c3.932-3.774 6.209-9.045 6.209-15.41S48.519 8.273 43.611 20.083z"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        title: 'Firebase Error',
        description: 'Firebase is not configured. Cannot sign in.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: 'Sign In Error',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <BriefcaseBusiness className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to CollabFlow</CardTitle>
          <CardDescription>
            Sign in to manage your collaborations seamlessly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Sign in with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
