import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  // This error will be thrown when the server starts, making it very clear
  // that the API key is missing from the environment variables.
  throw new Error("FATAL: GEMINI_API_KEY environment variable not set. Please check your hosting environment variables.");
} else {
  // Log a masked version of the key to help debug.
  const maskedKey = `${geminiApiKey.substring(0, 4)}...${geminiApiKey.substring(geminiApiKey.length - 4)}`;
  console.log(`GEMINI_API_KEY loaded successfully. Length: ${geminiApiKey.length}, Value: ${maskedKey}`);
}

// Rely on the default behavior of the Google AI plugin to find the API key
// from the environment variables.
export const ai = genkit({
  plugins: [googleAI()],
});
