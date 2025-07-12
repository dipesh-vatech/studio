'use server';
/**
 * @fileOverview An AI agent that analyzes the performance of a social media post.
 *
 * - analyzePostPerformance - A function that handles the post performance analysis.
 * - AnalyzePostPerformanceInput - The input type for the function.
 * - AnalyzePostPerformanceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzePostPerformanceInputSchema = z.object({
  postDescription: z.string().describe('A description of the social media post, including its content, format, and goal.'),
  metrics: z.object({
    likes: z.number(),
    comments: z.number(),
    shares: z.number(),
    saves: z.number(),
  }),
  niche: z.string().describe('The influencer niche (e.g., "Fashion & Lifestyle").'),
  platform: z.string().describe('The social media platform (e.g., "Instagram", "TikTok").'),
});
export type AnalyzePostPerformanceInput = z.infer<typeof AnalyzePostPerformanceInputSchema>;

const AnalyzePostPerformanceOutputSchema = z.object({
  analysis: z.string().describe('A brief, 1-2 sentence summary of the post performance, highlighting what went well.'),
  suggestions: z.array(z.string()).describe('A list of 3 actionable, concise suggestions for improvement on future posts.'),
  rating: z.number().min(1).max(10).describe('An overall performance rating from 1 to 10.'),
});
export type AnalyzePostPerformanceOutput = z.infer<typeof AnalyzePostPerformanceOutputSchema>;

export async function analyzePostPerformance(input: AnalyzePostPerformanceInput): Promise<AnalyzePostPerformanceOutput> {
  return analyzePostPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePostPerformancePrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: AnalyzePostPerformanceInputSchema},
  output: {schema: AnalyzePostPerformanceOutputSchema},
  prompt: `You are an expert social media analyst. Your task is to analyze the performance of a post based on its description and user-provided metrics.

Post Details:
- Platform: {{{platform}}}
- Niche: {{{niche}}}
- Description: {{{postDescription}}}

Metrics:
- Likes: {{{metrics.likes}}}
- Comments: {{{metrics.comments}}}
- Shares: {{{metrics.shares}}}
- Saves: {{{metrics.saves}}}

Based on these details, provide a brief and concise analysis.
1.  **Analysis**: Write a 1-2 sentence summary of the performance. What do the metrics suggest? What likely went well?
2.  **Suggestions**: Provide 3 specific, actionable, and short suggestions for how to improve future content.
3.  **Rating**: Give an overall performance rating on a scale of 1 to 10, where 10 is outstanding.

Your analysis should be encouraging but also provide concrete, expert advice. Keep all text outputs as brief as possible.
  `,
});

const analyzePostPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzePostPerformanceFlow',
    inputSchema: AnalyzePostPerformanceInputSchema,
    outputSchema: AnalyzePostPerformanceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
