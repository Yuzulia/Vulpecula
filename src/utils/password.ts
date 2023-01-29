import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS = 10;

export async function generatePasswordHash(
  rawPassword: string
): Promise<string> {
  return await bcrypt.hash(rawPassword, BCRYPT_SALT_ROUNDS);
}

export async function validatePasswordHash(
  rawPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(rawPassword, hashedPassword);
}
