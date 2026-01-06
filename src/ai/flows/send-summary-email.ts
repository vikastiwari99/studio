'use server';

/**
 * @fileOverview Sends a practice session summary email to a guardian.
 * 
 * - sendSummaryEmail - A function that sends the summary email.
 * - SendSummaryEmailInput - The input type for the sendSummaryEmail function.
 * - SendSummaryEmailOutput - The return type for the sendSummaryEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import nodemailer from 'nodemailer';

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
  message: z.string().describe('A message indicating the result.'),
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
    const { email, topic, difficulty, score, totalProblems, timeSpent } = input;

    const smtpConfigMissing = !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS;

    // In production, if SMTP is not configured, we should fail gracefully.
    if (smtpConfigMissing && process.env.NODE_ENV === 'production') {
        console.error('SMTP configuration is missing in production environment. Cannot send email.');
        // Do not throw an error, but return a failure message.
        return { success: false, message: 'Email service is not configured on the server.' };
    }
    
    // In development, simulate the email if SMTP is not configured.
    if (smtpConfigMissing) {
      console.warn('SMTP environment variables not set. Simulating email. Check your .env file.');
      console.log('--- SIMULATING PRACTICE SUMMARY EMAIL (SMTP details missing) ---');
      console.log(`To: ${email}`);
      console.log('Subject: Your MathMentorAI Practice Summary');
      console.log('Body:');
      console.log(`Great work! Here is the summary of the latest practice session:`);
      console.log(`- Topic: ${topic}`);
      console.log(`- Difficulty: ${difficulty}`);
      console.log(`- Score: ${score} / ${totalProblems}`);
      console.log(`- Time Spent: ${timeSpent}`);
      console.log('------------------------------------');
      // In dev, we can consider this a "success" for UI purposes, but indicate simulation.
      return { success: true, message: 'Email simulated in console. SMTP configuration is missing.' };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (Number(process.env.SMTP_PORT) || 587) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"MathMentorAI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your MathMentorAI Practice Summary',
      html: `
        <h1>MathMentorAI Practice Summary</h1>
        <p>Great work! Here is the summary of the latest practice session:</p>
        <ul>
          <li><strong>Topic:</strong> ${topic}</li>
          <li><strong>Difficulty:</strong> ${difficulty}</li>
          <li><strong>Score:</strong> ${score} / ${totalProblems}</li>
          <li><strong>Time Spent:</strong> ${timeSpent}</li>
        </ul>
        <p>Keep up the great work!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email summary sent to ${email}`);
      return { success: true, message: `Email summary sent to ${email}` };
    } catch (error) {
      console.error('Failed to send email:', error);
      // In case of an error, do not expose detailed error info to the client
      throw new Error('There was an error sending the summary email. Please check the server logs.');
    }
  }
);
