import { AbstractMigration, Info, ClientPostgreSQL } from "https://deno.land/x/nessie@2.0.10/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
    /** Runs on migrate */
    async up(info: Info): Promise<void> {
        await this.client.queryArray(`
create table accounts
(
    id                    uuid                  not null
        constraint accounts_pk
            primary key,
    handle                varchar               not null
        unique,
    display_name          varchar,
    title                 varchar,
    biography             text,
    location              varchar,
    created_at            timestamp with time zone,
    updated_at            timestamp with time zone,
    deleted_at            timestamp with time zone,
    is_bot                boolean default false not null,
    is_manual_approve     boolean default false not null,
    is_manual_approve_bot boolean default false not null,
    is_moderator          boolean default false not null,
    is_administrator      boolean default false not null,
    is_silence            boolean default false not null,
    is_suspend            boolean default false not null
);
        `);
        await this.client.queryArray(`
        create unique index accounts_handle_uindex
            on accounts (handle);
        `);
    }

    /** Runs on rollback */
    async down(info: Info): Promise<void> {
        await this.client.queryArray('drop table accounts;');
    }
}
