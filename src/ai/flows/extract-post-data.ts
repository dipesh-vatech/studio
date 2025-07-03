'use server';
/**
 * @fileOverview An AI agent that simulates extracting social media post data from a URL by generating plausible metrics.
 *
 * - extractPostData - A function that handles the post data extraction.
 * - ExtractPostDataInput - The input type for the extractPostData function.
 * - ExtractPostDataOutput - The return type for the extractPostData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExtractPostDataInputSchema = z.object({
  postUrl: z.string().url().describe('The URL of the social media post.'),
});
export type ExtractPostDataInput = z.infer<typeof ExtractPostDataInputSchema>;

const ExtractPostDataOutputSchema = z.object({
  postTitle: z.string().describe("A plausible title for the post, based on the URL. Should be creative and engaging."),
  platform: z.enum(["Instagram", "TikTok", "YouTube"]).describe("The platform inferred from the post URL."),
  likes: z.number().describe('A plausible number of likes for a successful post.'),
  comments: z.number().describe('A plausible number of comments for a successful post.'),
  shares: z.number().describe('A plausible number of shares for a successful post.'),
  saves: z.number().describe('A plausible number of saves for a successful post.'),
  conversion: z.boolean().describe('A plausible boolean indicating if the post led to a conversion.'),
});
export type ExtractPostDataOutput = z.infer<typeof ExtractPostDataOutputSchema>;


export async function extractPostData(input: ExtractPostDataInput): Promise<ExtractPostDataOutput> {
  return extractPostDataFlow(input);
}

// This tool simulates fetching metrics from a real API.
// In a real-world app, this is where you would place your API call to Instagram/TikTok.
const getPostMetrics = ai.defineTool(
  {
    name: 'getPostMetrics',
    description: 'A tool to fetch the engagement metrics for a social media post URL. This is a simulation and will return realistic, generated data.',
    inputSchema: z.object({ postUrl: z.string().url() }),
    outputSchema: z.object({
      likes: z.number(),
      comments: z.number(),
      shares: z.number(),
      saves: z.number(),
    }),
  },
  async ({ postUrl }) => {
    // Simulate fetching data by generating plausible random numbers.
    const getMetric = (base: number, variance: number) => base + Math.floor(Math.random() * variance);
    
    if (postUrl.includes('tiktok')) {
      return {
        likes: getMetric(100000, 250000),
        comments: getMetric(5000, 15000),
        shares: getMetric(20000, 50000),
        saves: getMetric(10000, 30000),
      };
    } else if (postUrl.includes('youtube')) {
       return {
        likes: getMetric(50000, 150000),
        comments: getMetric(2000, 8000),
        shares: getMetric(1000, 5000),
        saves: getMetric(2000, 10000), // Less common on YouTube but we can simulate it
      };
    }
    // Default to Instagram style metrics
    return {
      likes: getMetric(5000, 25000),
      comments: getMetric(200, 1500),
      shares: getMetric(100, 800),
      saves: getMetric(500, 2000),
    };
  }
);


const prompt = ai.definePrompt({
    name: 'extractPostDataPrompt',
    model: 'googleai/gemini-2.0-flash',
    tools: [getPostMetrics],
    input: {schema: ExtractPostDataInputSchema},
    output: {schema: ExtractPostDataOutputSchema},
    prompt: `You are an expert social media analyst. Your task is to analyze a social media post from a given URL and provide a summary.

Analyze the provided URL: {{{postUrl}}}

1.  **Infer Platform**: First, identify whether the platform is Instagram, TikTok, or YouTube from the URL's domain.
2.  **Generate a Contextual Title**: Based on any hints in the URL path, create a plausible and creative title for the post. Make it sound like a real post title.
3.  **Fetch Metrics**: Use the 'getPostMetrics' tool to retrieve the engagement numbers (likes, comments, shares, saves) for the post.
4.  **Estimate Conversion**: Based on the fictional title and the metrics from the tool, make a plausible guess on whether the post led to a conversion (e.g., a sale or sign-up).

Provide the final, consolidated output in the specified JSON format.
    `,
});

const extractPostDataFlow = ai.defineFlow(
    {
        name: 'extractPostDataFlow',
        inputSchema: ExtractPostDataInputSchema,
        outputSchema: ExtractPostDataOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
