/**
 * Generates a user name from email address
 * @param email - Email address
 * @returns Generated name from email (part before @)
 */
export function generateNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format');
  }
  
  const name = email.split('@')[0];
  
  // Remove special characters and make it more readable
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .replace(/^[0-9]/, 'user$&'); // If starts with number, prefix with 'user'
}

/**
 * Validates if a string is a valid email
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a string is a valid name (alphanumeric, min 2 chars)
 * @param name - Name to validate
 * @returns True if valid name
 */
export function isValidName(name: string): boolean {
  return /^[a-zA-Z0-9_]{2,}$/.test(name);
}

/**
 * Sanitizes a name for safe usage
 * @param name - Name to sanitize
 * @returns Sanitized name
 */
export function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .substring(0, 50); // Limit length
}


