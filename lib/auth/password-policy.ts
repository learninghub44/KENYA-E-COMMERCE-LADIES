export type PasswordPolicy = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
};

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true
};

export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): string[] {
  const failures: string[] = [];

  if (password.length < policy.minLength) failures.push(`Use at least ${policy.minLength} characters.`);
  if (policy.requireUppercase && !/[A-Z]/.test(password)) failures.push("Include an uppercase letter.");
  if (policy.requireLowercase && !/[a-z]/.test(password)) failures.push("Include a lowercase letter.");
  if (policy.requireNumber && !/[0-9]/.test(password)) failures.push("Include a number.");
  if (policy.requireSymbol && !/[^A-Za-z0-9]/.test(password)) failures.push("Include a symbol.");

  return failures;
}
