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
  prompt: `You are an expert at analyzing social media screenshots. Your task is to extract key performance metrics from the provided image.

Analyze the attached screenshot and extract the following information:
- The post's title or caption.
- The number of likes. Look for a number next to a heart icon.
- The number of comments. Look for a number next to a speech bubble icon.
- The number of shares (if visible). Look for a number next to a paper plane or share icon.
- The number of saves (if visible). Look for a number next to a bookmark icon.

If a metric is not clearly visible in the image, do not guess or include it in the output. Provide only the information you can see. If you see text like "Liked by X and Y others", you can use that to determine the number of likes.

Screenshot: {{media url=screenshotDataUri}}
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
