export function APIUnauthorized(): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: "UNAUTHORIZED",
        description:
          "The API request cannot be completed due to incorrect credentials.",
      },
    }),
    {
      status: 401,
      statusText: "Unauthorized",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export function APIMethodNotAllowed(): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: "METHOD_NOT_ALLOWED",
        description: "This HTTP method is not supported.",
      },
    }),
    {
      status: 405,
      statusText: "Method Not Allowed",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
