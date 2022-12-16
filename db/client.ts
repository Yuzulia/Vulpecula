import { Database, PostgresConnector } from "denodb/mod.ts";
import { config } from "../libs/config.ts";

const connector = new PostgresConnector({
    database: config.database.name,
    host: config.database.hostname,
    username: config.database.user,
    password: config.database.password,
    port: config.database.port,
    tls: {
        enable: config.database.tls,
    }
});

export const db = new Database(connector);
