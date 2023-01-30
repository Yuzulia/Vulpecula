import type { APIContext } from "astro";
import { TOKEN_COOKIE_NAME } from "../../libs/const";
import { UserManager } from "../../libs/repository/user";

export async function get({
  redirect,
  cookies,
}: APIContext): Promise<Response> {
  if (cookies.has(TOKEN_COOKIE_NAME)) {
    await UserManager.revokeToken(
      cookies.get(TOKEN_COOKIE_NAME).value as string
    );
    cookies.delete(TOKEN_COOKIE_NAME, {
      path: "/",
    });
  }
  return redirect("/");
}
