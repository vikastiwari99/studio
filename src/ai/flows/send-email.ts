'use server';
/**
 * @fileOverview A flow for sending emails.
 *
 * - sendEmail - A function that sends an email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail as sendEmailService } from '@/services/email';

export const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The body of the email (text or HTML).'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput): Promise<void> {
  await sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // In a real application, you would integrate with a real email service
    // like SendGrid, Mailgun, or AWS SES. For this example, we'll use a
    // mock service that just logs to the console.
    await sendEmailService(input);
  }
);