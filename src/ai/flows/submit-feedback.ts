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
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';


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

if (admin.apps.length === 0) {
    admin.initializeApp();
}

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
    try {
      const db = getFirestore();
      await db.collection('feedback').add({
        userId: input.userId,
        feedback: input.feedback,
        submittedAt: new Date(),
      });

      console.log(`New user feedback received from ${input.userId}:`, input.feedback);

      return {
        success: true,
        message: 'Feedback received. Thank you!',
      };
    } catch (error) {
       console.error("Error saving feedback to Firestore:", error);
       return {
         success: false,
         message: "Could not save feedback. Please try again later."
       }
    }
  }
);
