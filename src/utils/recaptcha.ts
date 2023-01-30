export async function recaptchaVerify(
  body: FormData,
  ip?: string
): Promise<boolean> {
  switch (import.meta.env.VULPECULA_RECAPTCHA) {
    case "recaptcha": {
      if (!body.has("g-recaptcha-response")) return false;
      const token = body.get("g-recaptcha-response") as string;
      const formData = new FormData();
      formData.append(
        "secret",
        import.meta.env.VULPECULA_RECAPTCHA_SITE_SECRET as string
      );
      formData.append("response", token);
      if (ip !== undefined) formData.append("remoteip", ip);
      const fetchResult = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          body: formData,
          method: "POST",
        }
      );
      const fetchJson = (await fetchResult.json()) as RecaptchaResponse;
      if (!fetchJson.success) return false;
      return true;
    }
    case "turnstile": {
      if (!body.has("cf-turnstile-response")) return false;
      const token = body.get("cf-turnstile-response") as string;
      const formData = new FormData();
      formData.append(
        "secret",
        import.meta.env.VULPECULA_RECAPTCHA_SITE_SECRET as string
      );
      formData.append("response", token);
      if (ip !== undefined) formData.append("remoteip", ip);
      const fetchResult = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          body: formData,
          method: "POST",
        }
      );
      const fetchJson = (await fetchResult.json()) as TurnstileResponse;
      if (!fetchJson.success) return false;
      return true;
    }
    default:
      return true;
  }
}

interface RecaptchaResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  "error-codes": string[];
}

interface TurnstileResponse {
  success: boolean;
  "error-codes": string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}
