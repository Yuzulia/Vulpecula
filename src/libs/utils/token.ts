import { nanoid } from "nanoid/async";

export async function createSessionToken(): Promise<string> {
  return await nanoid(32);
}

export async function createVerifyToken(): Promise<string> {
  return await nanoid(16);
}
