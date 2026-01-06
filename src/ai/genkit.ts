import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

if (!process.env.GEMINI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The GEMINI_API_KEY environment variable is not set. Please add it to your hosting provider\'s environment variables.');
  } else {
    throw new Error('The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.');
  }
}

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  // The default model is configured in the prompt itself.
});
