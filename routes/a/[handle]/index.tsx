import { Handlers } from "$fresh/src/server/types.ts";
import { Account } from "../../../db/models/account.ts";
import { HandlerContext } from "https://deno.land/x/rutt@0.0.13/mod.ts";

export const handler: Handlers<unknown> = {
    async GET(req: Request, ctx: HandlerContext) {
        const { handle } = ctx.params;
        const data = await Account.where('handle', 'ILIKE', handle).first();
        if (!data) {
            return ctx.renderNotFound();
        }
        return ctx.render();
    }
}

export default function AccountShow() {
    return (
        <>
        </>
    );
}
