
'use server';
/**
 * @fileOverview An AI agent that generates a daily briefing for an influencer.
 *
 * - generateWeeklyBriefing - A function that handles the briefing generation.
 * - GenerateWeeklyBriefingInput - The input type for the function.
 * - GenerateWeeklyBriefingOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

const DealSchema = z.object({
  id: z.string(),
  campaignName: z.string(),
  brandName: z.string(),
  status: z.string(),
  dueDate: z.string(),
  payment: z.number(),
  tasks: z.array(TaskSchema),
});

const GenerateWeeklyBriefingInputSchema = z.object({
  deals: z.array(DealSchema),
  userName: z.string(),
});
export type GenerateWeeklyBriefingInput = z.infer<typeof GenerateWeeklyBriefingInputSchema>;

// Internal schema that includes the pre-calculated completed task count
const DealWithTaskCountSchema = DealSchema.extend({
    completedTaskCount: z.number(),
});

const InternalBriefingInputSchema = z.object({
    deals: z.array(DealWithTaskCountSchema),
    userName: z.string(),
});


const GenerateWeeklyBriefingOutputSchema = z.object({
  greeting: z.string().describe("A warm, personalized greeting for the user."),
  summaryPoints: z.array(z.string()).describe("A list of 3-4 concise, actionable summary points highlighting the most important priorities for the day/week."),
});
export type GenerateWeeklyBriefingOutput = z.infer<typeof GenerateWeeklyBriefingOutputSchema>;


export async function generateWeeklyBriefing(input: GenerateWeeklyBriefingInput): Promise<GenerateWeeklyBriefingOutput> {
    return generateWeeklyBriefingFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateWeeklyBriefingPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: InternalBriefingInputSchema }, // Use internal schema with pre-calculated count
    output: { schema: GenerateWeeklyBriefingOutputSchema },
    prompt: `You are an expert-level virtual assistant for a social media influencer named {{{userName}}}. 
    Your task is to analyze their current list of brand deals and generate a concise, encouraging, and actionable "Daily Briefing".

    Today's date is ${new Date().toLocaleDateString()}.

    Analyze the following deals:
    {{#each deals}}
    - Campaign: "{{campaignName}}" with {{brandName}}
      - Status: {{status}}
      - Due Date: {{dueDate}}
      - Payment: \${{payment}}
      - Tasks: {{tasks.length}} total, {{completedTaskCount}} completed.
      - Task List: 
      {{#each tasks}}
        - {{title}} ({{#if completed}}Completed{{else}}Incomplete{{/if}})
      {{/each}}
    {{/each}}

    Follow these instructions precisely:
    1.  **Greeting:** Start with a friendly, personalized greeting for {{{userName}}}.
    2.  **Analyze and Prioritize:** Look at all the deals. Identify the most urgent and important items for the upcoming day and week. Consider factors like approaching due dates, high payment values, and uncompleted tasks.
    3.  **Generate Summary Points:** Create a list of 3-4 bullet points. Each point should be a single, actionable sentence. Do not just list deals; provide context and suggest action. For example, instead of "Deal X is due Friday", say "Focus on finishing the 'final video' task for Deal X, as it's your highest paying deal this week and due on Friday."
    4.  **Tone:** Your tone should be encouraging, professional, and helpful. You are their trusted assistant.
    5.  **Output:** Return the output in the specified JSON format.
    `,
});


const generateWeeklyBriefingFlow = ai.defineFlow(
    {
        name: 'generateWeeklyBriefingFlow',
        inputSchema: GenerateWeeklyBriefingInputSchema,
        outputSchema: GenerateWeeklyBriefingOutputSchema,
    },
    async (input) => {
        if (input.deals.length === 0) {
            return {
                greeting: `Hi ${input.userName}!`,
                summaryPoints: ["It's a quiet day! You have no active deals. A great time to plan new content or pitch to brands."],
            };
        }

        // Pre-process the data to add the completed task count
        const dealsWithTaskCount = input.deals.map(deal => ({
            ...deal,
            completedTaskCount: deal.tasks.filter(t => t.completed).length,
        }));
        
        const internalInput = {
            ...input,
            deals: dealsWithTaskCount,
        };

        const { output } = await prompt(internalInput);
        return output!;
    }
);
