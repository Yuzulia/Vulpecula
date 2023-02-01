import type { AstroCookies } from "astro/dist/core/cookies";
import { TOKEN_COOKIE_NAME } from "../const";
import { UserManager } from "../repository/user";

export async function isCookieLogin(cookies: AstroCookies): Promise<boolean> {
  return (
    cookies.has(TOKEN_COOKIE_NAME) &&
    (await UserManager.validateSessionToken(
      cookies.get(TOKEN_COOKIE_NAME).value as string
    ))
  );
}
