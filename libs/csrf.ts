import { computeAesGcmTokenPair, computeVerifyAesGcmTokenPair } from "csrf/mod.ts";
import { config } from "./config.ts";
import { CSRFGenerateError } from "./error.ts";
import { getCookies, setCookie } from "$std/http/cookie.ts";

const CSRF_COOKIE_NAME = 'csrf_token';

export interface CSRFToken {
    cookieStr: string;
    tokenStr: string;
}

interface CsrfValidationOptions {
    csrfFormName: string;
}

export function csrfCreateToken(): CSRFToken {
    const csrfToken = computeAesGcmTokenPair(config.server.csrf_secret, 900)
    if (!csrfToken.isSucccess) throw new CSRFGenerateError('CSRF token generate failed.')
    return {
        cookieStr: csrfToken.cookieStr,
        tokenStr: csrfToken.tokenStr,
    }
}

export function setupCsrf(response: Response, csrf: CSRFToken): string {
    setCookie(response.headers, {
        name: CSRF_COOKIE_NAME,
        value: csrf.cookieStr,
        maxAge: 900,
        httpOnly: true,
        sameSite: 'Strict',
        secure: config.server.cookie_secure,
    });

    return csrf.tokenStr;
}

export async function validateCsrfToken(
    req: Request,
    options: CsrfValidationOptions = {
        csrfFormName: 'csrf_token'
    }
): Promise<boolean> {
    const form = await req.formData();
    const csrfToken = form.get(options.csrfFormName) as string || '';
    const csrfCookie = getCookies(req.headers)[CSRF_COOKIE_NAME];

    return computeVerifyAesGcmTokenPair(config.server.csrf_secret, csrfToken, csrfCookie);
}
