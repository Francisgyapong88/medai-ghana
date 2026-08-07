// Requires a properly-positioned @ symbol and a real-looking domain
// ending (.com, .org, .edu, .gov, .net, .gh, .edu.gh, .com.gh, etc.)
// rather than just "something after a dot".
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}