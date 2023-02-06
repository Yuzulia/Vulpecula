import { Prisma } from "@prisma/client";
import type { AstroCookies } from "astro/dist/core/cookies";
import { TOKEN_COOKIE_NAME } from "../const";
import { UserManager } from "../repository/user";

export async function getCredentials(
  cookies: AstroCookies,
  headers: Headers
): Promise<UserManager | null> {
  if (cookies.has(TOKEN_COOKIE_NAME)) {
    try {
      return await UserManager.fromSessionToken(
        cookies.get(TOKEN_COOKIE_NAME).value as string
      );
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case "P2025": {
            // ignore
            break;
          }
          default: {
            throw e;
          }
        }
      } else {
        throw e;
      }
    }
  }

  // TODO: Bearer token authorization

  return null;
}
