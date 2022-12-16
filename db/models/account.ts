import { DataTypes, Model } from "denodb/mod.ts";

export class Account extends Model {
    static table = 'accounts';
    static timestamps = true;

    static fields = {
        id: {
            type: DataTypes.UUID,
        },
        handle: {
            type: DataTypes.STRING,
        },
        display_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        biography: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deleted_at: {
            type: DataTypes.TIMESTAMP,
            allowNull: true,
        }
    }
}
