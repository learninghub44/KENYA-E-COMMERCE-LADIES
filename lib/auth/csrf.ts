import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function createCsrfToken(secret: string, sessionId: string): string {
  const nonce = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", secret).update(`${sessionId}.${nonce}`).digest("hex");
  return `${nonce}.${signature}`;
}

export function verifyCsrfToken(secret: string, sessionId: string, token: string): boolean {
  const [nonce, signature] = token.split(".");
  if (!nonce || !signature) return false;

  const expected = createHmac("sha256", secret).update(`${sessionId}.${nonce}`).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
