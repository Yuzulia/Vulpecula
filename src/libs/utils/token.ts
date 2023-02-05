import { nanoid } from "nanoid/async";

export async function createSessionToken(): Promise<string> {
  return await nanoid(32);
}

export async function createEmailVerifyToken(): Promise<string> {
  return await nanoid(16);
}

export async function createPasswordResetToken(): Promise<string> {
  return await nanoid(64);
}
