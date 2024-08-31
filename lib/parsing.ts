export const attemptToRepairMalformedJson = (malformedJson: string) =>
  // Regular expression to match double-quoted strings with possible newlines
  malformedJson.replace(/"(.*?)"/gs, (match) => {
    // Replace any newline characters inside the string with the escape sequence
    return match.replace(/\n/g, "\\n");
  });
