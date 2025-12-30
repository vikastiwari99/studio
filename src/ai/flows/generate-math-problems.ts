'use server';

/**
 * @fileOverview Generates math problems based on user-selected grade level, topic, and difficulty.
 *
 * - generateMathProblem - A function that generates a math problem.
 * - GenerateMathProblemInput - The input type for the generateMathProblem function.
 * - GenerateMathProblemOutput - The return type for the generateMathProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMathProblemInputSchema = z.object({
  gradeLevel: z.string().describe('The grade level of the student.'),
  topic: z.string().describe('The math topic for the problem.'),
  difficulty: z.string().describe('The difficulty level of the problem (Basic, Moderate, Complex).'),
});
export type GenerateMathProblemInput = z.infer<typeof GenerateMathProblemInputSchema>;

const GenerateMathProblemOutputSchema = z.object({
  problemStatement: z.string().describe('The generated math problem statement.'),
});
export type GenerateMathProblemOutput = z.infer<typeof GenerateMathProblemOutputSchema>;

export async function generateMathProblem(input: GenerateMathProblemInput): Promise<GenerateMathProblemOutput> {
  return generateMathProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMathProblemPrompt',
  input: {schema: GenerateMathProblemInputSchema},
  output: {schema: GenerateMathProblemOutputSchema},
  prompt: `You are a math problem generator for students.

  Generate a math problem based on the following parameters:

  Grade Level: {{{gradeLevel}}}
  Topic: {{{topic}}}
  Difficulty: {{{difficulty}}}

  The problem statement should be clear and concise.
  `,
});

const generateMathProblemFlow = ai.defineFlow(
  {
    name: 'generateMathProblemFlow',
    inputSchema: GenerateMathProblemInputSchema,
    outputSchema: GenerateMathProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
