import {
    ClientPostgreSQL,
    NessieConfig,
} from "nessie/mod.ts";
import { config as vulpeculaConfig } from "./libs/config.ts";

export const client = new ClientPostgreSQL({
    database: vulpeculaConfig.database.name,
    hostname: vulpeculaConfig.database.hostname,
    port: vulpeculaConfig.database.port,
    user: vulpeculaConfig.database.user,
    password: vulpeculaConfig.database.password,
    tls: {
        enable: vulpeculaConfig.database.tls
    }
});

/** This is the final config object */
const config: NessieConfig = {
    client,
    migrationFolders: ["./db/migrations"],
    seedFolders: ["./db/seeds"],
};

// noinspection JSUnusedGlobalSymbols
export default config;
