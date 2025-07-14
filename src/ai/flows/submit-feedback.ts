'use server';
/**
 * @fileOverview An AI flow for handling user feedback submissions.
 *
 * - submitFeedback - A function that receives and logs user feedback.
 * - SubmitFeedbackInput - The input type for the submitFeedback function.
 * - SubmitFeedbackOutput - The return type for the submitFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SubmitFeedbackInputSchema = z.object({
  feedback: z.string().min(10).describe('The user-provided feedback text.'),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackInputSchema>;

const SubmitFeedbackOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SubmitFeedbackOutput = z.infer<typeof SubmitFeedbackOutputSchema>;

export async function submitFeedback(
  input: SubmitFeedbackInput
): Promise<SubmitFeedbackOutput> {
  return submitFeedbackFlow(input);
}

const submitFeedbackFlow = ai.defineFlow(
  {
    name: 'submitFeedbackFlow',
    inputSchema: SubmitFeedbackInputSchema,
    outputSchema: SubmitFeedbackOutputSchema,
  },
  async (input) => {
    // For now, we'll just log the feedback.
    // This could be extended to save to Firestore, send an email,
    // or run sentiment analysis.
    console.log('New user feedback received:', input.feedback);

    return {
      success: true,
      message: 'Feedback received. Thank you!',
    };
  }
);
