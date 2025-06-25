'use server';
/**
 * @fileOverview An AI agent that simulates extracting social media post data from a URL by generating plausible metrics.
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
    prompt: `You are an expert social media analyst. Your task is to analyze a social media post from a given URL and provide realistic performance metrics.

**IMPORTANT**: You cannot access the URL directly. Instead, you must act as if you have seen the content and are generating a realistic summary.

Analyze the provided URL: {{{postUrl}}}

1.  **Infer Platform**: Identify whether the platform is Instagram, TikTok, or YouTube from the URL's domain.
2.  **Generate a Contextual Title**: Based on any hints in the URL path (like slugs or IDs), create a plausible and creative title for the post. For example, a URL like \`.../p/Cq.../\` might inspire a title about a specific event or product. Make it sound like a real post title.
3.  **Generate Realistic Metrics**: Generate a set of performance numbers (likes, comments, shares, saves) that are realistic for a *successful* post on the inferred platform. The numbers should be high but believable. For example, a successful Instagram post might have thousands of likes, while a viral TikTok could have hundreds of thousands.
4.  **Estimate Conversion**: Based on the fictional title and metrics, make a plausible guess on whether the post led to a conversion (e.g., a sale or sign-up).

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
