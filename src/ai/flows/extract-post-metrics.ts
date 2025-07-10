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
  model: 'googleai/gemini-2.0-flash',
  input: {schema: ExtractPostMetricsInputSchema},
  output: {schema: ExtractPostMetricsOutputSchema},
  prompt: `You are an expert data extractor. Your task is to analyze the provided screenshot of a social media post and extract key performance metrics with high accuracy.

Analyze the attached screenshot: {{media url=screenshotDataUri}}

Follow these instructions precisely:

1.  **Extract Post Title/Caption:** Find the main text or caption of the post.
2.  **Extract Likes:**
    *   Look for text that says "Liked by [username] and [number] others".
    *   If you find this pattern, you MUST calculate the total likes by adding 1 (for the username) to the [number].
    *   **Example:** If you see "Liked by Craig and 24 others", the total likes is 25. You must output 25.
    *   If you just see a number next to a heart icon, use that number.
3.  **Extract Comments:**
    *   PRIORITY 1: Look for text that says "[username] and [number] other commented". If found, you MUST calculate the total comments by adding 1 to the [number]. For example, "shivdip_2602 and 1 other commented" means the total is 2. You MUST output 2.
    *   PRIORITY 2: If the above pattern is not found, look for text that says "View all [number] comments". If found, use that number.
    *   PRIORITY 3: If neither of the above text patterns are found, look for a number next to a comment bubble icon. If you find it, use that number for the comments.
4.  **Extract Shares & Saves:** Look for numbers next to a share icon (like a paper plane) or a save icon (like a bookmark).
5.  **Output:** Provide only the data you can confidently extract in the specified format. If a metric is not visible, do not include it.
  `,
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
