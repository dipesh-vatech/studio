import { config } from 'dotenv';
config();

import '@/ai/flows/generate-pitch-email.ts';
import '@/ai/flows/extract-contract-details.ts';
import '@/ai/flows/generate-content-ideas.ts';
import '@/ai/flows/suggest-post-time.ts';
import '@/ai/flows/analyze-post-performance.ts';
