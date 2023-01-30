import Tokens from "csrf";
import { redisClient } from "../redis";

const CSRF_EXPIRY_SECONDS = 3600;
const CSRF_TOKEN_OPTIONS: Tokens.Options = {
  saltLength: 8,
  secretLength: 18,
};
export const DEFAULT_CSRF_TOKEN_NAME = "csrf_token";

export class CsrfManager {
  private readonly csrfTokensClass: Tokens;
  private _secretToken?: string;
  private _csrfToken?: string;

  // eslint-disable-next-line accessor-pairs
  set secretToken(newSecretToken: string) {
    this._secretToken = newSecretToken;
  }

  // eslint-disable-next-line accessor-pairs
  set csrfToken(newCsrfToken: string) {
    this._csrfToken = newCsrfToken;
  }

  constructor() {
    this.csrfTokensClass = new Tokens(CSRF_TOKEN_OPTIONS);
  }

  static async fetchToken(csrfToken: string): Promise<CsrfManager> {
    const instance = new CsrfManager();
    const secretToken = await redisClient.get(`csrf:${csrfToken}`);
    if (secretToken === null)
      throw new CsrfError(
        "Cannot fetch secret token because specified csrf token is returned nil"
      );
    instance.csrfToken = csrfToken;
    instance.secretToken = secretToken;

    return instance;
  }

  static async fromFormData(
    body: FormData,
    csrfTokenName: string = DEFAULT_CSRF_TOKEN_NAME
  ): Promise<CsrfManager> {
    if (!body.has(csrfTokenName))
      throw new CsrfError("csrfTokenName is invalid");

    return await this.fetchToken(body.get(csrfTokenName) as string);
  }

  private async saveToken(): Promise<void> {
    if (this._csrfToken === undefined || this._secretToken === undefined)
      throw new CsrfError("csrfToken or secretToken is undefined");

    await redisClient.set(`csrf:${this._csrfToken}`, this._secretToken, {
      EX: CSRF_EXPIRY_SECONDS,
    });
  }

  verify(): boolean {
    if (this._csrfToken === undefined || this._secretToken === undefined)
      throw new CsrfError("csrfToken or secretToken is undefined");

    return this.csrfTokensClass.verify(this._secretToken, this._csrfToken);
  }

  async remove(): Promise<void> {
    if (this._csrfToken === undefined)
      throw new CsrfError("csrfToken is undefined");

    await redisClient.del(`csrf:${this._csrfToken}`);
  }

  async generateToken(): Promise<string> {
    this._secretToken = await this.csrfTokensClass.secret();
    this._csrfToken = this.csrfTokensClass.create(this._secretToken);
    await this.saveToken();
    return this._csrfToken;
  }
}

export class CsrfError extends Error {}
