import OpenAI, { RateLimitError } from "openai";
import { env } from "~/env";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { attemptToRepairMalformedJson } from "./parsing";

const runningLocally = env.OPENAI_BASEURL?.includes("http://localhost");

const muscles_to_use = [
  "Biceps",
  "Shoulders",
  "Neck",
  "Serratus anterior",
  "Chest",
  "Triceps",
  "Abs",
  "Calves",
  "Glutes",
  "Traps",
  "Quads",
  "Forearms",
  "Hamstrings",
  "Lats",
  "Brachialis",
  "Obliques",
  "Soleus",
  "Lower back",
  "Rhomboids",
] as const;

const categories_to_use = [
  "Abs",
  "Arms",
  "Back",
  "Calves",
  "Cardio",
  "Chest",
  "Legs",
  "Shoulders",
  "Stretch",
] as const;

// If running locally, use llama3.1:latest
const model = runningLocally ? "llama3.1:latest" : env.OPENAI_API_MODEL;
const schema = z.object({
  name: z.string().describe("Name of the exercise"),
  category: z.enum(categories_to_use).describe("Category of the exercise"),
  how_to_perform: z.string().describe("How to perform the exercise"),
  short_summary: z.string().describe("Short summary of the exercise"),
  muscles_used: z
    .array(z.enum(muscles_to_use).describe("Muscles used in the exercise"))
    .describe("Muscles used in the exercise"),
  equipment_used: z
    .array(z.string())
    .describe("Equipment used in the exercise"),
  alternative_names: z.array(z.string()).describe("Alternative names"),
});

const additionalContext = `

Example 1:
{
  "name": "Dips",
  "how_to_perform": "1. Start by standing in between a set of parallel bars, with one bar on either side of you. Grip each bar firmly with your palms facing inward (towards your body).\n\n2. Lift yourself up off the ground by pressing down on the bars and extend your arms fully. Your legs should be hanging straight down and your body shouldn't be touching the bars.\n\n3. Keep your core engaged and your body upright. Lean slightly forward to emphasize activation in the chest muscles. Keep your elbows close to your body.\n\n4. Slowly lower your body by bending your elbows. Keep your elbows tucked in close to your sides as you lower yourself. Lower until your elbows are at about a 90-degree angle or slightly below. Feel the stretch in your chest and triceps.\n\n5. Pause briefly at the bottom of the movement.\n\n6. Push yourself back up to the starting position by straightening your arms. Ensure your movements are controlled, focusing on using your chest and triceps to lift.\n\n7. Repeat for the desired number of repetitions, keeping your core tight and your movements controlled throughout the exercise.",
  "short_summary": "Dips are an upper body exercise that primarily works the triceps, chest, and shoulders and can be performed using parallel bars.",
  "muscles_used": [
    "Triceps",
    "Chest",
    "Shoulders",
    "Abs"
  ],
  "equipment_used": [
    "Parallel bars"
  ],
  "alternative_names": [
    "Parallel Bar Dips"
  ]
}

Example 2:
{
  "name": "Mountain Climbers",
  "how_to_perform": "1. Begin in a high plank position with your hands placed shoulder-width apart on the ground and your body forming a straight line from your head to your heels. Align your shoulders directly over your wrists.\n2. Engage your core by pulling your belly button towards your spine, ensuring that your hips do not sag or pike upwards throughout the movement.\n3. Lift your right foot off the ground and drive your right knee towards your chest, keeping your left foot stationary.\n4. Quickly switch legs, placing your right foot back on the ground as you simultaneously lift your left foot and drive your left knee towards your chest.\n5. Continue alternating legs at a fast pace while maintaining the plank position, ensuring your abs stay engaged and your back remains flat throughout the exercise.\n6. Once you complete the desired number of repetitions or time duration, lower your knees to the floor and rest.",
  "short_summary": "Mountain climbers are a dynamic, high-intensity exercise that combines cardio and strength training, performed in a plank position while alternating leg movements.",
  "muscles_used": [
    "Abs",
    "Quads",
    "Hamstrings",
    "Glutes",
    "Shoulders",
    "Calves"
  ],
  "equipment_used": [],
  "alternative_names": [
    "Running Plank",
    "Alternating Knee Thrusts"
  ]
}`;

export const defaultExercisePrompt = (
  exerciseName: string,
) => `INSTRUCTION: Write a detailed set of step by step instructions for the exercise: "${exerciseName}".

* Use the following schema:

{
  "name": "string",
  "category": "string",
  "how_to_perform": "string",
  "short_summary": "string",
  "muscles_used": ["string"],
  "equipment_used": ["string"],
  "alternative_names": ["string"]
}

* Use one of the following categories in the "category" field: ${categories_to_use.join(
  ", ",
)}
* Do not use any other categories.
* Use only the following muscles in the "muscles_used" field: ${muscles_to_use.join(
  ", ",
)}
* Do not use any other muscles.
* Use Markdown formatting in the "how_to_perform" field. Do not format other fields.
* Do not include any other text in the "how_to_perform" field - no titles or headers. Only include the instructions.
* There should be no other text in your response, other than the JSON object.
${runningLocally ? additionalContext : ""}`;

const defaultChatCompletionPrompt = `You are a helpful assistant, and you are very good at writing detailed summaries of physical exercises. Only answer in valid JSON, using the correct escape characters.`;

const responseFormat = zodResponseFormat(schema, "text");

const getFilename = async (name: string) => {
  const directory = `./src/fixtures/llm-output/exercises/${model}`;
  await mkdir(directory, { recursive: true });
  const filename = `${directory}/${name.replaceAll("/", "-")}.json`;
  return filename;
};

const MAX_RETRIES = 3;

export async function getExerciseChatCompletion(exercise: {
  name: string | null;
}) {
  if (!exercise.name) throw new Error("Exercise name not found");
  const filename = await getFilename(exercise.name);

  try {
    await stat(filename); // Checks if file exists, if it doesn't an error is thrown
    const fileContent = await readFile(filename, "utf-8");
    const parsed = schema.safeParse(JSON.parse(fileContent));
    if (parsed.success) return parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // If the file does not exist, continue to generate new completion
  }

  const prompt = defaultExercisePrompt(exercise.name);
  const delay = new Promise((resolve) => setTimeout(resolve, 20000));
  console.log("Generating description for", exercise.name);
  const response = await getChatCompletion(prompt);
  if (response) {
    await writeFile(filename, JSON.stringify(response, undefined, 2));
  }
  if (!runningLocally) {
    console.log("Having a sleep");
    await delay;
  }
  return response;
}

const max_timeout = 20000 * 16;

export async function getChatCompletion(
  prompt: string,
  timeout = 20000,
  retries = 0,
) {
  const client = new OpenAI({
    baseURL: env.OPENAI_BASEURL,
    apiKey: env.OPENAI_API_KEY ?? "",
  });
  let chatCompletion: OpenAI.Chat.Completions.ChatCompletion;
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: defaultChatCompletionPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];
    chatCompletion = await client.chat.completions.create({
      messages,
      response_format: responseFormat,
      model: model ?? "gpt-3.5-turbo",
    });
  } catch (error) {
    console.log("Error generating completion");
    console.error(error);
    if (error instanceof RateLimitError && timeout < max_timeout) {
      console.log("Rate limit error, waiting...");
      await new Promise((resolve) => setTimeout(resolve, timeout));
      return getChatCompletion(prompt, timeout * 2);
    }
    return null;
  }
  if (!chatCompletion.choices[0]) throw new Error("No response");
  const response = chatCompletion.choices[0].message;
  if (!response.content) throw new Error("No content");

  // try to parse the response as JSON
  try {
    const JSONparsed = JSON.parse(response.content) as unknown;
    const parsedResponse = schema.parse(JSONparsed);
    return parsedResponse;
  } catch (first_error) {
    try {
      const potentialRepair = attemptToRepairMalformedJson(
        response.content,
        schema,
      );
      console.log("Error parsing response - attempting to repair");
      const tried_again: unknown = JSON.parse(potentialRepair);
      const parsedResponse = schema.parse(tried_again);
      return parsedResponse;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log(response.content);
      console.error(first_error);
      console.log("Error parsing response for a second time");
      console.error(error);
      if (retries < MAX_RETRIES) {
        console.log("Retrying...");
        retries++;
        return await getChatCompletion(prompt, timeout, retries);
      }
    }
  }
  return null;
}
