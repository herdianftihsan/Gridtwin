import { config } from '../config/env.js';
import { geminiClient } from '../ai/gemini.client.js';

async function runSmokeTest() {
  console.log(`- provider: Google Gemini SDK`);
  console.log(`- model used: ${config.GEMINI_MODEL}`);

  try {
    const candidateText = await geminiClient.generateText({
      messages: [{ role: 'user', content: 'Respond with exactly: OK' }],
      temperature: 0,
      maxTokens: 10,
    });
    
    console.log(`- parsed response: ${candidateText}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(`- root cause if it fails: ${err.message}`);
    } else {
      console.log(`- root cause if it fails: ${String(err)}`);
    }
  }
}

runSmokeTest().catch(console.error);
