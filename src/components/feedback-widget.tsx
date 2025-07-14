
'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Loader2, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from './app-provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user, db } = useAppData();

  const handleSubmit = async () => {
    if (!db) {
      toast({
        title: 'Error',
        description: 'Database is unavailable. Cannot submit feedback.',
        variant: 'destructive',
      });
      return;
    }

    if (feedback.length < 10) {
      toast({
        title: 'Feedback Too Short',
        description: 'Please provide at least 10 characters of feedback.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      const emailCheck = z.string().email({ message: "Please enter a valid email address." });
      const result = emailCheck.safeParse(email);
      if (!result.success) {
        toast({
          title: 'Invalid Email',
          description: result.error.issues[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const submissionData: {
        feedback: string;
        submittedAt: any;
        userId?: string;
        email?: string;
      } = {
        feedback: feedback,
        submittedAt: serverTimestamp(),
      };

      if (user) {
        submissionData.userId = user.uid;
      } else {
        submissionData.email = email;
      }

      await addDoc(collection(db, 'feedback'), submissionData);

      setIsSubmitted(true);
      setFeedback('');
      setEmail('');
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => setIsSubmitted(false), 500); // Reset for next time
      }, 2000);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: 'An Error Occurred',
        description:
          'Something went wrong while submitting your feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    // Reset internal state if closing without submitting
    if (!open && !isSubmitted) {
      setFeedback('');
      setEmail('');
    }
    setIsOpen(open);
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Provide Feedback</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4 mb-2" align="end" side="top">
        {isSubmitted ? (
           <div className="flex flex-col items-center justify-center text-center space-y-2 p-4">
            <ThumbsUp className="h-10 w-10 text-green-500" />
            <h4 className="font-semibold">Thank You!</h4>
            <p className="text-sm text-muted-foreground">Your feedback has been received.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Provide Feedback</h4>
              <p className="text-sm text-muted-foreground">
                Help us improve by sharing your thoughts.
              </p>
            </div>
            <div className="grid gap-4">
              {!user && (
                <div className="space-y-2">
                  <Label htmlFor="feedback-email">Email Address</Label>
                  <Input 
                    id="feedback-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="feedback-textarea">Feedback</Label>
                <Textarea
                  id="feedback-textarea"
                  placeholder="What do you like or dislike?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
