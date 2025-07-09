
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppData } from '@/components/app-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { type ProfileType } from '@/lib/types';

const onboardingSchema = z.object({
  displayName: z.string().min(1, 'Please enter your name.'),
  niche: z.string().min(1, 'Please enter your niche (e.g., Fashion, Tech).'),
});

export function OnboardingDialog() {
  const { user, userProfile, updateUserProfile, markOnboardingAsCompleted } =
    useAppData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // We only want this to run on the client after hydration
    if (userProfile && userProfile.onboardingCompleted === false) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [userProfile]);

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: '',
      niche: '',
    },
  });

  useEffect(() => {
    if (user || userProfile) {
      form.reset({
        displayName: user?.displayName || '',
        niche: userProfile?.niche || '',
      });
    }
  }, [user, userProfile, form]);

  async function onSubmit(values: z.infer<typeof onboardingSchema>) {
    if (!userProfile) return;
    setIsSubmitting(true);
    try {
      await updateUserProfile({
        ...values,
        profileType: userProfile.profileType,
      });
      await markOnboardingAsCompleted();
      setIsOpen(false);
    } catch (error) {
      console.error('Onboarding submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Prevent dialog from being part of the initial server render
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Welcome to CollabFlow!
          </DialogTitle>
          <DialogDescription>
            Let's get your profile set up so we can personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Niche</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Fashion & Lifestyle, Tech Reviews"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps our AI generate better ideas for you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Get Started
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
