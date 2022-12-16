import { parse } from "$std/encoding/toml.ts";

export interface IVulpeculaConfig {
    server: {
        csrf_secret: string;
        cookie_secure: boolean;
    },
    database: {
        hostname: string;
        port: number;
        user: string;
        password: string;
        name: string;
        tls: boolean;
    }
}

const configure = async () => {
    try {
        const rawConfigArray = await Deno.readFile('vulpecula.toml');
        const rawConfig = new TextDecoder().decode(rawConfigArray);
        return parse(rawConfig) as unknown as IVulpeculaConfig;
    } catch (e) {
        // TODO: ファイル読み込みエラーとかのハンドリング
        throw e;
    }
}

export const config = await configure();
