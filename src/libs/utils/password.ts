import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 10;

export async function generatePasswordHash(
  rawPassword: string
): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return await bcrypt.hash(rawPassword, salt);
}

export async function validatePasswordHash(
  rawPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(rawPassword, hashedPassword);
}
