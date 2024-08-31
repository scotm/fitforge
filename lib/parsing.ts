import { type z } from "zod";

export const attemptToRepairMalformedJson = <T>(
  malformedJson: string,
  schema?: z.ZodType<T>,
) => {
  // Discard everything outside the curly braces
  const discardRegex = /\{(.*)\}/gs;
  const capturedGroup = malformedJson.match(discardRegex);
  if (!capturedGroup) throw new Error("No captured group found");

  // Extract the captured group
  const capturedGroupString = capturedGroup[0];
  if (!capturedGroupString) throw new Error("No captured group string");
  // Regular expression to match double-quoted strings with possible newlines
  const resultString = capturedGroupString.replace(/"(.*?)"/gs, (match) => {
    // Replace any newline characters inside the string with the escape sequence
    return match.replace(/\n/g, "\\n");
  });
  try {
    if (schema) {
      const parsed = schema.safeParse(JSON.parse(resultString));
      if (parsed.success) return resultString;
      console.error(parsed.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {}
  throw new Error("Cannot recover malformed JSON");
};
