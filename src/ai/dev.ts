import { config } from 'dotenv';
config();

import '@/ai/flows/generate-pitch-email.ts';
import '@/ai/flows/extract-contract-details.ts';
import '@/ai/flows/generate-content-ideas.ts';
import '@/ai/flows/suggest-post-time.ts';
import '@/ai/flows/analyze-post-performance.ts';
import '@/ai/flows/extract-post-metrics.ts';
import '@/ai/flows/generate-weekly-briefing.ts';
import '@/ai/flows/submit-feedback.ts';
