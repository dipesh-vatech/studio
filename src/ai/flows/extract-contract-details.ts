'use server';
/**
 * @fileOverview An AI agent that extracts key details from a contract PDF.
 *
 * - extractContractDetails - A function that handles the contract detail extraction.
 * - ExtractContractDetailsInput - The input type for the extractContractDetails function.
 * - ExtractContractDetailsOutput - The return type for the extractContractDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExtractContractDetailsInputSchema = z.object({
  contractDataUri: z
    .string()
    .describe(
      "A PDF file of a contract, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractContractDetailsInput = z.infer<typeof ExtractContractDetailsInputSchema>;

const ExtractContractDetailsOutputSchema = z.object({
  brandName: z.string().describe('The name of the brand or company mentioned in the contract.'),
  startDate: z.string().describe('The start date of the contract term, formatted as YYYY-MM-DD.'),
  endDate: z.string().describe('The end date of the contract term, formatted as YYYY-MM-DD.'),
  deliverables: z.string().describe('A summary of the key deliverables required by the contract (e.g., "2 Instagram posts, 1 Story").'),
  payment: z.number().describe('The total payment amount specified in the contract.'),
});
export type ExtractContractDetailsOutput = z.infer<typeof ExtractContractDetailsOutputSchema>;

export async function extractContractDetails(input: ExtractContractDetailsInput): Promise<ExtractContractDetailsOutput> {
  return extractContractDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractContractDetailsPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: ExtractContractDetailsInputSchema},
  output: {schema: ExtractContractDetailsOutputSchema},
  prompt: `You are an expert legal assistant specializing in contract analysis. Your task is to carefully read the provided contract PDF and extract the following key details:

- The Brand Name (the company the influencer is collaborating with)
- The Start Date of the agreement
- The End Date of the agreement
- The key Deliverables (e.g., "2 Instagram posts, 1 Story")
- The total Payment amount promised to the influencer

Analyze the contract provided as a PDF.
Contract: {{media url=contractDataUri}}

Provide the extracted information in the specified JSON format. Ensure dates are in YYYY-MM-DD format.
  `,
});

const extractContractDetailsFlow = ai.defineFlow(
  {
    name: 'extractContractDetailsFlow',
    inputSchema: ExtractContractDetailsInputSchema,
    outputSchema: ExtractContractDetailsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
