import { geminiClient } from './apps/api/src/ai/gemini.client.js';
import { buildWhatIfPrompt } from './apps/api/src/ai/prompts/what-if.js';

async function test() {
  try {
    const prompt = buildWhatIfPrompt("What if I install 10 kWp of solar?");
    const res = await geminiClient.generateContent(prompt);
    console.log("Response:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
