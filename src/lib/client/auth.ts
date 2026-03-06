import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.CLIENT_JWT_SECRET;

if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("Missing CLIENT_JWT_SECRET environment variable");
}

const JWT_SECRET = new TextEncoder().encode(
  secretKey || "dev-fallback-secret-key-change-me",
);

// ============================================
// Password Utilities
// ============================================

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ============================================
// JWT Utilities
// ============================================

export interface ClientTokenPayload {
  clientId: string;
  eventId: string;
  email: string;
  label: string;
}

export async function createClientToken(
  payload: ClientTokenPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyClientToken(
  token: string,
): Promise<ClientTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as ClientTokenPayload;
  } catch {
    return null;
  }
}
