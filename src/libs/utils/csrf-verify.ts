import { CsrfManager, CsrfError } from "../repository/csrf";

export async function csrfVerify(formData: FormData): Promise<Response | null> {
  let cmPost: CsrfManager;
  try {
    cmPost = await CsrfManager.fromFormData(formData);
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
