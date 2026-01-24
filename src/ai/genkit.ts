import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  // This error will be thrown when the server starts, making it very clear
  // that the API key is missing from the environment variables.
  throw new Error("FATAL: GEMINI_API_KEY environment variable not set. Please set it in your hosting environment.");
}

// Explicitly passing the API key to rule out any issues with automatic
// environment variable detection by the Genkit plugin.
export const ai = genkit({
  plugins: [googleAI({ apiKey: geminiApiKey })],
});
