import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// The googleAI() plugin will automatically look for the GEMINI_API_KEY 
// in the environment variables. If it's not found, Genkit will throw
// a clear error. We recommend setting this in your hosting provider's
// environment variable settings.
export const ai = genkit({
  plugins: [googleAI()],
  // The model used for generation is configured in the prompt definition.
});
