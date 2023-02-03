import type { Host, User, UserAuth } from "@prisma/client";
import {
  generatePasswordHash,
  IdGeneratorManager,
  validatePasswordHash,
  generateKeyPairAsync,
  createSessionToken,
  createEmailVerifyToken,
} from "../utils";
import { databaseClient } from "../database";
import { redisClient } from "../redis";
import {
  EMAIL_REGEX,
  FULL_HANDLE_REGEX,
  HANDLE_LOCAL_REGEX,
} from "../utils/regex";

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
    if (umc.email.match(EMAIL_REGEX) === null)
      throw new UserManagerError("malformed email");

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

  static async fromSessionToken(token: string): Promise<UserManager> {
    const userSessionData = await databaseClient.userSession.findUniqueOrThrow({
      where: {
        token,
      },
      include: {
        user: {
          include: {
            host: true,
          },
        },
      },
    });
    if (
      userSessionData.revokedAt !== null &&
      userSessionData.revokedAt < new Date(Date.now())
    )
      throw new UserManagerError("Session token is revoked");
    return new UserManager(userSessionData.user);
  }

  static async validateSessionToken(token: string): Promise<boolean> {
    const key = `sessionToken:${token}`;

    let ex = 3600;
    let userId = await redisClient.get(key);
    if (userId === null) {
      const userSessionData = await databaseClient.userSession.findUnique({
        where: {
          token,
        },
        select: {
          userId: true,
          revokedAt: true,
        },
      });
      if (userSessionData === null) return false;
      if (
        userSessionData.revokedAt !== null &&
        userSessionData.revokedAt < new Date(Date.now())
      )
        return false;
      if (userSessionData.revokedAt !== null) {
        ex = Math.min(
          3600,
          Math.floor((Date.now() - userSessionData.revokedAt.getTime()) / 1000)
        );
      }
      userId = userSessionData.userId;
    }
    await redisClient.set(key, userId, {
      EX: ex,
      XX: true,
    });
    return true;
  }

  static async revokeToken(token: string): Promise<void> {
    const key = `sessionToken:${token}`;
    await redisClient.del(key);
    await databaseClient.userSession.update({
      where: {
        token,
      },
      data: {
        revokedAt: new Date(Date.now()),
      },
    });
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
    if (handle.match(HANDLE_LOCAL_REGEX) === null) return false;

    const handleCount = await databaseClient.user.count({
      where: {
        handle: {
          equals: handle,
          mode: "insensitive",
        },
        host: {
          fqdn: {
            equals: ".",
          },
        },
      },
    });
    if (handleCount > 0) return false;

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

  async login(umsc: UserManagerSessionCreate): Promise<string> {
    if (!this.isLocalUser)
      throw new UserManagerError("Remote user is not supported");
    if (umsc.expiresAt !== undefined && umsc.expiresAt <= new Date(Date.now()))
      throw new UserManagerError("expiresAt must not past time");
    const token = await createSessionToken();

    await databaseClient.userSession.create({
      data: {
        token,
        userId: this.user.id,
        ip: umsc.ip,
        userAgent: umsc.userAgent,
        revokedAt: umsc.expiresAt,
      },
    });

    let ex = 3600;
    if (umsc.expiresAt !== undefined) {
      ex = Math.min(
        3600,
        Math.floor((Date.now() - umsc.expiresAt.getTime()) / 1000)
      );
    }
    await redisClient.set(`sessionToken:${token}`, this.user.id, {
      EX: ex,
    });

    return token;
  }

  async getAuth(): Promise<UserAuth | null> {
    return await databaseClient.userAuth.findUnique({
      where: {
        id: this.user.id,
      },
    });
  }

  async setEmail(
    email: string,
    isEmailVerified: boolean = true
  ): Promise<void> {
    if (!this.isLocalUser)
      throw new UserManagerError("Remote user is not supported");

    await databaseClient.userAuth.update({
      where: {
        id: this.user.id,
      },
      data: {
        email,
        isEmailVerified,
      },
    });
  }

  async issueEmailVerificationCode(newEmail: string): Promise<string> {
    const token = await createEmailVerifyToken();
    const key = `emailToken:${token}`;
    await redisClient.hSet(key, "email", newEmail);
    await redisClient.hSet(key, "userId", this.user.id);
    await redisClient.expire(key, 1800);
    return token;
  }

  static async verifyEmailVerification(token: string): Promise<boolean> {
    const key = `emailToken:${token}`;
    const email = await redisClient.hGet(key, "email");
    if (email === undefined || email === null) return false;
    const targetUserId = await redisClient.hGet(key, "userId");
    if (targetUserId === undefined || targetUserId === null)
      throw new UserManagerError("Email verification key error.");
    const targetUser = await UserManager.fromId(targetUserId);
    if (!targetUser.isLocalUser) return false;
    await targetUser.setEmail(email);
    await redisClient.del(key);
    return true;
  }

  async changePassword(newPassword: string): Promise<void> {
    if (!this.isLocalUser)
      throw new UserManagerError("Remote user is not supported");
    const hashedNewPassword = await generatePasswordHash(newPassword);
    await databaseClient.userAuth.update({
      where: {
        id: this.user.id,
      },
      data: {
        password: hashedNewPassword,
      },
    });
  }
}

export interface UserManagerCreate {
  email: string;
  password: string;
  options?: {
    bypassEmailAuthentication?: boolean;
  };
}

export interface UserManagerSessionCreate {
  ip?: string;
  userAgent?: string;
  expiresAt?: Date;
}

export class UserManagerError extends Error {}
