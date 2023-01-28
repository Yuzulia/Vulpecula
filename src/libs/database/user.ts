import type { User } from "@prisma/client";
import { IdGeneratorManager } from "../../utils";
import { databaseClient } from "./connector";

export class UserManager {
  private constructor(public readonly user: User) {}

  static async createLocalUser(umc: UserManagerCreate) {
    const newId = IdGeneratorManager.generate();
    // TODO: Password hash utility

    const newUser = await databaseClient.user.create({
      data: {
        id: newId.id,
        host: {
          connect: {
            fqdn: ".",
          },
        },
        auth: {
          create: {
            email: umc.email,
            password: umc.password,
            isEmailVerified: umc.options?.byPassEmailAuthentication || false,
          },
        },
        // TODO: RSA Generator utility
        // key: {
        //     create: {
        //
        //     }
        // }
      },
    });

    return new UserManager(newUser);
  }
}

export interface UserManagerCreate {
  email: string;
  password: string;
  options?: {
    byPassEmailAuthentication?: boolean;
  };
}
