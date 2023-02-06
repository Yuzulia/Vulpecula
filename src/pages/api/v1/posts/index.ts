import type { APIContext } from "astro";
import { getCredentials } from "../../../../libs/api/credentials";
import {
  APIMethodNotAllowed,
  APIUnauthorized,
} from "../../../../libs/api/response";

export function get(): Response {
  return APIMethodNotAllowed();
}

export async function post({
  cookies,
  request,
}: APIContext): Promise<Response> {
  const currentUser = await getCredentials(cookies, request.headers);
  if (currentUser === null) return APIUnauthorized();

  return new Response(null, {
    status: 200,
    statusText: "OK",
  });
}
