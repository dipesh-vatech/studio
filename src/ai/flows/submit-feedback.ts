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
  userId: z.string().describe('The ID of the user submitting feedback.')
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

// This flow now only logs the feedback to the server console.
// The actual database write is handled on the client-side for simplicity
// and to leverage existing client authentication.
const submitFeedbackFlow = ai.defineFlow(
  {
    name: 'submitFeedbackFlow',
    inputSchema: SubmitFeedbackInputSchema,
    outputSchema: SubmitFeedbackOutputSchema,
  },
  async (input) => {
    try {
      console.log(`New user feedback received from ${input.userId}:`, input.feedback);

      return {
        success: true,
        message: 'Feedback received. Thank you!',
      };
    } catch (error) {
       console.error("Error in feedback flow:", error);
       return {
         success: false,
         message: "Could not process feedback. Please try again later."
       }
    }
  }
);
