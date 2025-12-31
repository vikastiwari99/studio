'use server';

import { generateMathProblem, GenerateMathProblemInput, GenerateMathProblemOutput } from '@/ai/flows/generate-math-problems';
import { provideHintsForProblem, ProvideHintsForProblemInput, ProvideHintsForProblemOutput } from '@/ai/flows/provide-hints-for-problem';
import { sendEmail, SendEmailInput } from '@/ai/flows/send-email';
import { doc, setDoc, getDoc, DocumentReference } from 'firebase/firestore';
import { getSdks } from '@/firebase'; // Assuming getSdks is exported and gives firestore instance
import type { MathProblem } from '@/components/math-mentor';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function generateProblemAction(input: GenerateMathProblemInput): Promise<GenerateMathProblemOutput> {
  try {
    return await generateMathProblem(input);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate a math problem. Please try again.");
  }
}

export async function getHintsAction(input: ProvideHintsForProblemInput): Promise<ProvideHintsForProblemOutput> {
  try {
    return await provideHintsForProblem(input);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate hints. Please try again.");
  }
}

export async function sendEmailAction(input: SendEmailInput): Promise<void> {
  try {
    await sendEmail(input);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Depending on requirements, you might want to throw an error
    // or handle it silently.
  }
}

interface SaveProblemActionInput {
  problem: MathProblem;
  guardianId: string;
}

export async function saveProblemAction(input: SaveProblemActionInput): Promise<void> {
  const { problem, guardianId } = input;
  const { firestore } = getSdks();

  // Assuming studentId is managed under guardian, but for now we use guardianId for path
  // This structure might need to be adjusted based on final data model
  const problemRef = doc(firestore, `/guardians/${guardianId}/students/${problem.studentId}/problems/${problem.id}`);

  setDoc(problemRef, problem, { merge: true })
    .catch(error => {
      const permissionError = new FirestorePermissionError({
        path: problemRef.path,
        operation: 'write',
        requestResourceData: problem,
      });
      errorEmitter.emit('permission-error', permissionError);
      // Re-throw or handle as needed, for now we let the emitter handle it.
      // The client will not receive a crash but the developer will see the error.
    });
}


export async function handleSolutionViewed(problemId: string, guardianId: string) {
  const { firestore } = getSdks();
  // This path seems incorrect given the firestore rules. I'll assume it should be derived.
  // A direct reference to a problem without its full path might fail security rules.
  // For now, this function is not called by the updated component, but leaving it for reference.
  // A proper implementation would require finding the studentId for the problemId.
  const problemDocRef = doc(firestore, `problems/${problemId}`); // Adjust path if necessary
  const guardianDocRef = doc(firestore, `guardians/${guardianId}`);

  try {
    const [problemDoc, guardianDoc] = await Promise.all([
      getDoc(problemDocRef),
      getDoc(guardianDocRef)
    ]);

    if (!problemDoc.exists() || !guardianDoc.exists()) {
      console.error("Problem or Guardian not found");
      return;
    }

    const problem = problemDoc.data();
    const guardian = guardianDoc.data();

    if (guardian.email) {
      await sendEmailAction({
        to: guardian.email,
        subject: `Solution Viewed for: ${problem.topic} Problem`,
        body: `The full solution for the following problem was viewed:\n\n${problem.problemStatement}`,
      });
    }

  } catch (error) {
    console.error("Error in handleSolutionViewed:", error);
  }
}
