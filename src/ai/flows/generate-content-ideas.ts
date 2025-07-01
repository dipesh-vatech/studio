'use server';
/**
 * @fileOverview An AI agent that generates content ideas for a campaign.
 *
 * - generateContentIdeas - A function that handles content idea generation.
 * - GenerateContentIdeasInput - The input type for the function.
 * - GenerateContentIdeasOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateContentIdeasInputSchema = z.object({
  campaignName: z.string().describe('The name of the campaign.'),
  brandName: z.string().describe('The name of the brand.'),
  deliverables: z.string().describe('The required deliverables for the campaign (e.g., "2 Instagram posts, 1 Story").'),
  niche: z.string().describe('The influencer niche (e.g., "Fashion & Lifestyle").'),
});
export type GenerateContentIdeasInput = z.infer<typeof GenerateContentIdeasInputSchema>;

const GenerateContentIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).describe('A list of creative content ideas for the campaign.'),
});
export type GenerateContentIdeasOutput = z.infer<typeof GenerateContentIdeasOutputSchema>;

export async function generateContentIdeas(input: GenerateContentIdeasInput): Promise<GenerateContentIdeasOutput> {
  return generateContentIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentIdeasPrompt',
  input: {schema: GenerateContentIdeasInputSchema},
  output: {schema: GenerateContentIdeasOutputSchema},
  prompt: `You are an expert social media strategist. Your task is to generate creative and engaging content ideas for an influencer campaign.

Campaign Details:
- Brand: {{{brandName}}}
- Campaign: {{{campaignName}}}
- Niche: {{{niche}}}
- Deliverables: {{{deliverables}}}

Based on these details, generate 3 distinct and creative content ideas that would perform well on social media. The ideas should be tailored to the niche and the required deliverables.
  `,
});

const generateContentIdeasFlow = ai.defineFlow(
  {
    name: 'generateContentIdeasFlow',
    inputSchema: GenerateContentIdeasInputSchema,
    outputSchema: GenerateContentIdeasOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
