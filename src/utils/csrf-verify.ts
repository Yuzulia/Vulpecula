import { CsrfManager, CsrfError } from "../libs/redis/csrf";

export async function csrfVerify(request: Request): Promise<Response | null> {
  let cmPost: CsrfManager;
  try {
    cmPost = await CsrfManager.fromRequest(request);
  } catch (e) {
    if (e instanceof CsrfError) {
      return new Response("CSRF Verification error", {
        status: 403,
        statusText: "Forbidden",
      });
    }

    throw e;
  }
  if (!cmPost.verify())
    return new Response("CSRF Verification error", {
      status: 403,
      statusText: "Forbidden",
    });
  await cmPost.remove();

  return null;
}
