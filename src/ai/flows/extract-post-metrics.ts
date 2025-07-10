'use server';
/**
 * @fileOverview An AI agent that extracts key metrics from a social media post screenshot.
 *
 * - extractPostMetrics - A function that handles the metric extraction from an image.
 * - ExtractPostMetricsInput - The input type for the function.
 * - ExtractPostMetricsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExtractPostMetricsInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of a social media post, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractPostMetricsInput = z.infer<typeof ExtractPostMetricsInputSchema>;

const ExtractPostMetricsOutputSchema = z.object({
  postTitle: z.string().describe('The title or main text content of the post. If no clear title, summarize the main caption.').optional(),
  likes: z.number().describe('The number of likes on the post.').optional(),
  comments: z.number().describe('The number of comments on the post.').optional(),
  shares: z.number().describe('The number of shares on the post. If not visible, do not include.').optional(),
  saves: z.number().describe('The number of saves on the post. If not visible, do not include.').optional(),
});
export type ExtractPostMetricsOutput = z.infer<typeof ExtractPostMetricsOutputSchema>;

export async function extractPostMetrics(input: ExtractPostMetricsInput): Promise<ExtractPostMetricsOutput> {
  return extractPostMetricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPostMetricsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: ExtractPostMetricsInputSchema},
  output: {schema: ExtractPostMetricsOutputSchema},
  prompt: `You are an expert data extractor. Analyze the provided screenshot of a social media post and extract the key performance metrics with high accuracy.

Analyze the attached screenshot: {{media url=screenshotDataUri}}

Follow these instructions precisely:
1.  **Extract Likes:** Find the number next to the heart icon. If you see text like "Liked by [username] and [number] others", the total likes is the [number] + 1.
2.  **Extract Comments:** Find the number next to the comment bubble icon. If you see text like "[username] and [number] other commented", the total comments is the [number] + 1. If you see "View all [number] comments", use that [number].
3.  **Extract Shares & Saves:** Look for numbers next to a share icon (like a paper plane) or a save icon (like a bookmark).
4.  **Extract Post Title/Caption:** Find the main text or caption of the post.
5.  **Output:** Provide only the data you can confidently extract in the specified format. If a metric is not visible, do not include it.`,
});

const extractPostMetricsFlow = ai.defineFlow(
  {
    name: 'extractPostMetricsFlow',
    inputSchema: ExtractPostMetricsInputSchema,
    outputSchema: ExtractPostMetricsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
