'use server';

/**
 * @fileOverview Provides step-by-step hints for a given math problem.
 *
 * - provideHintsForProblem - A function that generates hints for a math problem.
 * - ProvideHintsForProblemInput - The input type for the provideHintsForProblem function.
 * - ProvideHintsForProblemOutput - The return type for the provideHintsForProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideHintsForProblemInputSchema = z.object({
  gradeLevel: z.string().describe('The grade level of the student.'),
  topic: z.string().describe('The math topic of the problem.'),
  difficultyLevel: z.string().describe('The difficulty level of the problem (e.g., Basic, Moderate, Complex).'),
  problemStatement: z.string().describe('The math problem statement.'),
});
export type ProvideHintsForProblemInput = z.infer<typeof ProvideHintsForProblemInputSchema>;

const ProvideHintsForProblemOutputSchema = z.object({
  hints: z.array(z.string()).describe('An array of step-by-step hints to solve the problem.'),
});
export type ProvideHintsForProblemOutput = z.infer<typeof ProvideHintsForProblemOutputSchema>;

export async function provideHintsForProblem(input: ProvideHintsForProblemInput): Promise<ProvideHintsForProblemOutput> {
  return provideHintsForProblemFlow(input);
}

const provideHintsForProblemPrompt = ai.definePrompt({
  name: 'provideHintsForProblemPrompt',
  input: {schema: ProvideHintsForProblemInputSchema},
  output: {schema: ProvideHintsForProblemOutputSchema},
  model: 'gemini-pro',
  prompt: `You are an expert math tutor. Your goal is to provide helpful, step-by-step hints to students who are stuck on a math problem.

  The student is in grade level: {{{gradeLevel}}}.
  The topic is: {{{topic}}}.
  The difficulty level is: {{{difficultyLevel}}}.

  Here is the problem statement:
  {{problemStatement}}

  Provide a series of hints that will guide the student towards the solution without giving the answer directly. Each hint should build upon the previous one, offering increasingly specific guidance.
  Format the hints as a numbered list.
  `,
});

const provideHintsForProblemFlow = ai.defineFlow(
  {
    name: 'provideHintsForProblemFlow',
    inputSchema: ProvideHintsForProblemInputSchema,
    outputSchema: ProvideHintsForProblemOutputSchema,
  },
  async input => {
    const {output} = await provideHintsForProblemPrompt(input);
    return output!;
  }
);
