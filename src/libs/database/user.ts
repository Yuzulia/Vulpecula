import type { Host, User } from "@prisma/client";
import {
  generatePasswordHash,
  IdGeneratorManager,
  validatePasswordHash,
  generateKeyPairAsync,
} from "../../utils";
import { databaseClient } from "./connector";
import { FULL_HANDLE_REGEX, HANDLE_REGEX } from "../../utils/handle";

type UserManagerType = User & { host: Host };

export class UserManager {
  private constructor(private _user: UserManagerType) {}

  get user(): UserManagerType {
    return this._user;
  }

  get isLocalUser(): boolean {
    return this.user.host.fqdn === ".";
  }

  static async createLocalUser(umc: UserManagerCreate): Promise<UserManager> {
    const newId = IdGeneratorManager.generate();
    const newKeyPair = await generateKeyPairAsync();

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
            password: await generatePasswordHash(umc.password),
            isEmailVerified: umc.options?.bypassEmailAuthentication ?? false,
          },
        },
        key: {
          create: {
            privateKey: newKeyPair.privateKey,
            publicKey: newKeyPair.publicKey,
          },
        },
      },
      include: {
        host: true,
      },
    });

    return new UserManager(newUser);
  }

  static async fromId(id: string): Promise<UserManager> {
    const targetUser = await databaseClient.user.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        host: true,
      },
    });

    return new UserManager(targetUser);
  }

  static async fromHandle(handle: string): Promise<UserManager> {
    const handleMatch = handle.match(FULL_HANDLE_REGEX);
    if (handleMatch === null)
      throw new UserManagerError("Invalid handle format");
    const targetUser = await databaseClient.user.findFirstOrThrow({
      where: {
        handle: {
          equals: handle[1],
          mode: "insensitive",
        },
        host:
          handle[4] !== undefined
            ? {
                fqdn: {
                  equals: handle[4],
                  mode: "insensitive",
                },
              }
            : {
                fqdn: {
                  equals: ".",
                },
              },
      },
      include: {
        host: true,
      },
    });

    return new UserManager(targetUser);
  }

  static async fromEmail(email: string): Promise<UserManager> {
    const targetUserAuth = await databaseClient.userAuth.findFirstOrThrow({
      where: {
        email,
      },
      include: {
        user: {
          include: {
            host: true,
          },
        },
      },
    });

    return new UserManager(targetUserAuth.user);
  }

  async getEmail(): Promise<string | null> {
    const email = await databaseClient.userAuth.findUnique({
      where: {
        id: this.user.id,
      },
      select: {
        email: true,
      },
    });

    return email !== null ? email.email : null;
  }

  async validatePassword(password: string): Promise<boolean> {
    const targetUserAuth = await databaseClient.userAuth.findUnique({
      where: {
        id: this.user.id,
      },
      select: {
        password: true,
      },
    });

    if (targetUserAuth === null) return false;

    return await validatePasswordHash(password, targetUserAuth.password);
  }

  async setHandle(handle: string): Promise<boolean> {
    if (this.user.handle !== null) return false;
    if (handle.match(HANDLE_REGEX) === null) return false;

    const targetUserUpsert = await databaseClient.user.update({
      where: {
        id: this.user.id,
      },
      data: {
        handle,
      },
      include: {
        host: true,
      },
    });

    this._user = targetUserUpsert;
    return true;
  }
}

export interface UserManagerCreate {
  email: string;
  password: string;
  options?: {
    bypassEmailAuthentication?: boolean;
  };
}

export class UserManagerError extends Error {}
