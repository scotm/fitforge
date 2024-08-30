import OpenAI, { RateLimitError } from "openai";
import { env } from "~/env";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export const defaultExercisePrompt = (
  exerciseName: string,
) => `Write a detailed set of step by step instructions for the exercise: "${exerciseName}".

* Only answer in JSON format.
* Use Markdown formatting.
* Do not include any other text - no titles or headers. Only include the instructions.`;

const defaultChatCompletionPrompt = `You are a helpful assistant, and you are very good at writing detailed summaries of physical exercises.`;

const schema = z.object({
  name: z.string(),
  how_to_perform: z.string(),
  short_summary: z.string(),
  muscles_used: z.array(z.string()),
  equipment_used: z.array(z.string()),
});

const responseFormat = zodResponseFormat(schema, "text");

const getFilename = async (name: string) =>
  `./src/server/db/exercises/${name}.json`;

export async function getExerciseChatCompletion(exercise: {
  name: string | null;
}) {
  if (!exercise.name) throw new Error("Exercise name not found");
  const filename = await getFilename(exercise.name);
  const file = Bun.file(filename);
  if (await file.exists()) {
    const file = Bun.file(filename);
    const parsed = schema.safeParse(await file.json());
    if (parsed.success) return parsed.data;
  }
  const prompt = defaultExercisePrompt(exercise.name);
  const response = await getChatCompletion(prompt);
  if (response) {
    await Bun.write(filename, JSON.stringify(response, undefined, 2));
  }
  return response;
}

export async function getChatCompletion(prompt: string, timeout = 20000) {
  const client = new OpenAI({
    baseURL: env.OPENAI_BASEURL,
    apiKey: env.OPENAI_API_KEY ?? "",
  });
  let chatCompletion: OpenAI.Chat.Completions.ChatCompletion;
  try {
    chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: defaultChatCompletionPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: responseFormat,
      model: env.OPENAI_API_MODEL ?? "llama3.1:latest",
    });
  } catch (error) {
    console.log("Error generating completion");
    console.error(error);
    if (error instanceof RateLimitError) {
      console.log("Rate limit error, waiting...");
      await new Promise((resolve) => setTimeout(resolve, timeout));
      return getChatCompletion(prompt, timeout * 2);
    }
    return null;
  }
  if (!chatCompletion.choices[0]) throw new Error("No response");
  const response = chatCompletion.choices[0].message;
  if (!response.content) throw new Error("No content");
  const parsedResponse = schema.parse(JSON.parse(response.content));

  return parsedResponse;
}
