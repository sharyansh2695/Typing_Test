
// Allowed characters: letters, numbers, punctuation, spaces, newlines
const VALID_CHAR_REGEX = /^[a-zA-Z0-9\s.,!?'"()\-:;]+$/;

// Validate a whole paragraph
export function validateParagraph(paragraph) {
  const invalidChars = [];

  for (const char of paragraph) {
    if (!VALID_CHAR_REGEX.test(char)) {
      invalidChars.push(char);
    }
  }

  return {
    valid: invalidChars.length === 0,
    invalidChars: [...new Set(invalidChars)],
  };
}

// Validate a character during typing
export function isValidTypedChar(char) {
  return VALID_CHAR_REGEX.test(char);
}
