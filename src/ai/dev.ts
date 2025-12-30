import { config } from 'dotenv';
config();

import '@/ai/flows/generate-math-problems.ts';
import '@/ai/flows/provide-hints-for-problem.ts';
import '@/ai/flows/send-email.ts';
