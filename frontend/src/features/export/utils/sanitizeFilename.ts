const ILLEGAL_FILENAME_CHARACTERS = /[\\/:*?"<>|]/g;
const WHITESPACE = /\s+/g;

export function sanitizeFilename(input: string) {
  const cleaned = input
    .replace(ILLEGAL_FILENAME_CHARACTERS, "")
    .replace(WHITESPACE, " ")
    .trim();

  return cleaned || "writing-project";
}
