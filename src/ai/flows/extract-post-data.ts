'use server';
/**
 * @fileOverview An AI agent that extracts (generates plausible) social media post data from a URL.
 *
 * - extractPostData - A function that handles the post data extraction.
 * - ExtractPostDataInput - The input type for the extractPostData function.
 * - ExtractPostDataOutput - The return type for the extractPostData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
    name: 'extractPostDataPrompt',
    input: {schema: ExtractPostDataInputSchema},
    output: {schema: ExtractPostDataOutputSchema},
    prompt: `You are a social media analyst. Given a URL of a social media post, your task is to generate a plausible and realistic set of performance metrics for it.
    
    1.  **Infer the Platform**: Determine if the platform is Instagram, TikTok, or YouTube from the URL.
    2.  **Generate a Title**: Create a compelling and realistic title for the post that would be suitable for the given URL.
    3.  **Generate Metrics**: Generate realistic and positive engagement numbers (likes, comments, shares, saves). The numbers should look authentic for a successful influencer post.
    4.  **Determine Conversion**: Decide whether the post likely led to a conversion.
    
    Post URL: {{{postUrl}}}
    
    Provide the output in the specified JSON format.
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
