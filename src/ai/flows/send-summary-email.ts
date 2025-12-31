'use server';

/**
 * @fileOverview Sends a practice session summary email to a guardian.
 * 
 * - sendSummaryEmail - A function that sends the summary email.
 * - SendSummaryEmailInput - The input type for the sendSummaryEmail function.
 * - SendSummaryEmailOutput - The return type for the sendSummaryEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendSummaryEmailInputSchema = z.object({
  email: z.string().email().describe('The email address of the recipient.'),
  topic: z.string().describe('The math topic of the session.'),
  difficulty: z.string().describe('The difficulty level of the session.'),
  score: z.number().describe('The number of correct answers.'),
  totalProblems: z.number().describe('The total number of problems attempted.'),
  timeSpent: z.string().describe('The total time spent in the session (e.g., "15 minutes").'),
});
export type SendSummaryEmailInput = z.infer<typeof SendSummaryEmailInputSchema>;

const SendSummaryEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
});
export type SendSummaryEmailOutput = z.infer<typeof SendSummaryEmailOutputSchema>;

export async function sendSummaryEmail(input: SendSummaryEmailInput): Promise<SendSummaryEmailOutput> {
  return sendSummaryEmailFlow(input);
}

const sendSummaryEmailFlow = ai.defineFlow(
  {
    name: 'sendSummaryEmailFlow',
    inputSchema: SendSummaryEmailInputSchema,
    outputSchema: SendSummaryEmailOutputSchema,
  },
  async (input) => {
    // In a real application, you would integrate with an email service like SendGrid, Resend, etc.
    // For this example, we will just log the email content to the console.
    console.log('--- Sending Practice Summary Email ---');
    console.log(`To: ${input.email}`);
    console.log('Subject: Your Child\'s MathMentorAI Practice Summary');
    console.log('Body:');
    console.log(`Great work! Here is the summary of the latest practice session:`);
    console.log(`- Topic: ${input.topic}`);
    console.log(`- Difficulty: ${input.difficulty}`);
    console.log(`- Score: ${input.score} / ${input.totalProblems}`);
    console.log(`- Time Spent: ${input.timeSpent}`);
    console.log('------------------------------------');
    
    // Simulate a successful email send.
    return { success: true };
  }
);
