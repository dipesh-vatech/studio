'use server';

/**
 * @fileOverview AI agent that generates personalized pitch emails for influencers.
 *
 * - generatePitchEmail - A function that generates the pitch email.
 * - GeneratePitchEmailInput - The input type for the generatePitchEmail function.
 * - GeneratePitchEmailOutput - The return type for the generatePitchEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GeneratePitchEmailInputSchema = z.object({
  followerCount: z
    .number()
    .describe('The number of followers the influencer has.'),
  engagementRate: z
    .number()
    .describe('The engagement rate of the influencer (as a decimal).'),
  averageLikes: z
    .number()
    .describe('The average number of likes per post.'),
  averageComments: z
    .number()
    .describe('The average number of comments per post.'),
  niche: z.string().describe('The niche of the influencer.'),
  brandName: z.string().describe('The name of the brand to pitch to.'),
  pastCollaborationExamples: z
    .string()
    .describe('Examples of past collaborations and their success.'),
});
export type GeneratePitchEmailInput = z.infer<typeof GeneratePitchEmailInputSchema>;

const GeneratePitchEmailOutputSchema = z.object({
  pitchEmail: z.string().describe('The generated, concise pitch email.'),
});
export type GeneratePitchEmailOutput = z.infer<typeof GeneratePitchEmailOutputSchema>;

export async function generatePitchEmail(
  input: GeneratePitchEmailInput
): Promise<GeneratePitchEmailOutput> {
  return generatePitchEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePitchEmailPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: GeneratePitchEmailInputSchema},
  output: {schema: GeneratePitchEmailOutputSchema},
  prompt: `You are an expert marketing assistant specialized in writing personalized pitch emails for social media influencers to send to brands for potential collaborations.

  Based on the influencer's stats and niche, you will generate a compelling but concise pitch email tailored to the specified brand, highlighting relevant metrics and past successes.

  Influencer Niche: {{{niche}}}
  Brand Name: {{{brandName}}}
  Follower Count: {{{followerCount}}}
  Engagement Rate: {{{engagementRate}}}
  Average Likes: {{{averageLikes}}}
  Average Comments: {{{averageComments}}}
  Past Collaboration Examples: {{{pastCollaborationExamples}}}

  Generate a professional, engaging, and brief pitch email that the influencer can send to the brand.
  The AI tool will decide which metrics to incorporate from the past content data, focusing on the most impressive and relevant ones to capture the brand's attention and demonstrate the influencer's value and potential for a successful partnership.
  Be sure to include a call to action. Keep the email to 3-4 short paragraphs.
  Do not include a subject line.
  Pitch Email:
  `,
});

const generatePitchEmailFlow = ai.defineFlow(
  {
    name: 'generatePitchEmailFlow',
    inputSchema: GeneratePitchEmailInputSchema,
    outputSchema: GeneratePitchEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
