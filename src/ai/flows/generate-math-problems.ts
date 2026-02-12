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
  seed: z.number().describe('A random number to ensure a unique problem is generated.'),
});
export type GenerateMathProblemInput = z.infer<typeof GenerateMathProblemInputSchema>;

const GenerateMathProblemOutputSchema = z.object({
  problemStatement: z.string().describe('The generated math problem statement.'),
  answer: z.string().describe('The correct answer to the problem.'),
});
export type GenerateMathProblemOutput = z.infer<typeof GenerateMathProblemOutputSchema>;

export async function generateMathProblem(input: GenerateMathProblemInput): Promise<GenerateMathProblemOutput> {
  return generateMathProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMathProblemPrompt',
  input: {schema: GenerateMathProblemInputSchema},
  output: {schema: GenerateMathProblemOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are a math problem generator for students.

  Generate a unique math problem and its corresponding answer based on the following parameters. Use the seed value to ensure variety.

  Grade Level: {{{gradeLevel}}}
  Topic: {{{topic}}}
  Difficulty: {{{difficulty}}}
  Seed: {{{seed}}}

  The problem statement should be clear and concise. The answer should be just the final numerical or symbolic answer, without explanation.
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
