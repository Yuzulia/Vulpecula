import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Head } from "$fresh/src/runtime/head.ts";
import { csrfCreateToken, setupCsrf, validateCsrfToken } from "../../libs/csrf.ts";

interface LoginData {
    csrfToken: string;
}

export const handler: Handlers = {
    async GET(req, ctx) {
        const csrfToken = csrfCreateToken();
        const response = await ctx.render({
            csrfToken: csrfToken.tokenStr,
        });
        setupCsrf(response, csrfToken);
        return response;
    },
    async POST(req, _ctx) {
        const csrfResult = await validateCsrfToken(req);
        if (csrfResult) {
            return new Response('CSRF is valid');
        } else {
            return new Response('CSRF is invalid');
        }
    }
}

export default function Login({ data }: PageProps<LoginData>) {
    return (
        <>
            <Head>
                <title>Login | Vulpecula</title>
            </Head>
            <form method="post">
                <input type="hidden" name="csrf_token" value={data.csrfToken} />
                <input type="submit" />
            </form>
        </>
    );
}
