'use server';
/**
 * @fileOverview An AI agent that suggests optimal posting times for social media.
 *
 * - suggestPostTime - A function that handles the suggestion.
 * - SuggestPostTimeInput - The input type for the function.
 * - SuggestPostTimeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestPostTimeInputSchema = z.object({
  niche: z.string().describe('The influencer niche (e.g., "Fashion & Lifestyle").'),
  platform: z.enum(["Instagram", "TikTok", "YouTube", "General"]).describe("The target social media platform."),
});
export type SuggestPostTimeInput = z.infer<typeof SuggestPostTimeInputSchema>;

const SuggestPostTimeOutputSchema = z.object({
  suggestion: z.string().describe('A summary of the best days and times to post for the given niche and platform.'),
});
export type SuggestPostTimeOutput = z.infer<typeof SuggestPostTimeOutputSchema>;

export async function suggestPostTime(input: SuggestPostTimeInput): Promise<SuggestPostTimeOutput> {
  return suggestPostTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPostTimePrompt',
  input: {schema: SuggestPostTimeInputSchema},
  output: {schema: SuggestPostTimeOutputSchema},
  prompt: `You are an expert social media analyst. Based on general industry knowledge, suggest the best days and times to post on {{{platform}}} for the "{{{niche}}}" niche.

Provide a concise summary of your recommendations. For example: "For the fashion niche on Instagram, try posting on Wednesdays and Fridays between 11 AM - 1 PM. Weekend evenings also see high engagement."
  `,
});

const suggestPostTimeFlow = ai.defineFlow(
  {
    name: 'suggestPostTimeFlow',
    inputSchema: SuggestPostTimeInputSchema,
    outputSchema: SuggestPostTimeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
