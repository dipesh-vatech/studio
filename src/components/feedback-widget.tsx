'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Loader2, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitFeedback } from '@/ai/flows/submit-feedback';
import { useAppData } from './app-provider';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAppData();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Not Signed In',
        description: 'You must be signed in to submit feedback.',
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

    setIsLoading(true);
    try {
      const result = await submitFeedback({ feedback, userId: user.uid });
      if (result.success) {
        setIsSubmitted(true);
        setFeedback('');
        setTimeout(() => {
            setIsOpen(false);
            setTimeout(() => setIsSubmitted(false), 500); // Reset for next time
        }, 2000);
      } else {
        toast({
          title: 'Submission Failed',
          description:
            result.message || 'We could not submit your feedback. Please try again later.',
          variant: 'destructive',
        });
      }
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
    if (!open && !isSubmitted) {
      // Allow closing if not in submitted state
      setIsOpen(false);
    }
    // If it's open or has just been submitted, control is handled internally
    setIsOpen(open);
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
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
            <div className="grid gap-2">
              <Label htmlFor="feedback-textarea" className="sr-only">
                Feedback
              </Label>
              <Textarea
                id="feedback-textarea"
                placeholder="What do you like or dislike?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
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
