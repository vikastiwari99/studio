'use server';

import { provideHintsForProblem, ProvideHintsForProblemInput, ProvideHintsForProblemOutput } from '@/ai/flows/provide-hints-for-problem';
import { sendSummaryEmail, SendSummaryEmailInput, SendSummaryEmailOutput } from '@/ai/flows/send-summary-email';

export async function getHintsAction(input: ProvideHintsForProblemInput): Promise<ProvideHintsForProblemOutput> {
  try {
    return await provideHintsForProblem(input);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate hints. Please try again.");
  }
}

export async function sendSummaryEmailAction(input: SendSummaryEmailInput): Promise<SendSummaryEmailOutput> {
  try {
    return await sendSummaryEmail(input);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send summary email. Please try again.");
  }
}
