'use server';

import type { SendEmailInput } from "@/ai/flows/send-email";

/**
 * Mock email sending service. In a real app, this would use an email API
 * like SendGrid, Postmark, etc.
 * @param input The email details.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean }> {
  console.log('***********************************');
  console.log('*** Mock Email Service ***');
  console.log(`To: ${input.to}`);
  console.log(`Subject: ${input.subject}`);
  console.log('Body:');
  console.log(input.body);
  console.log('***********************************');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real scenario, you'd handle potential errors from the email service.
  // For this mock, we'll always return success.
  return { success: true };
}