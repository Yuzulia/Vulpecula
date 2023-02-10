import {
  type Host,
  type Post,
  PostVisibility,
  type User,
} from "@prisma/client";
import { databaseClient } from "../database";
import { IdGeneratorManager } from "../utils";

type PostManagerType = Post & { author: User & { host: Host } };

export class PostManager {
  private constructor(private readonly _post: PostManagerType) {}

  get post(): PostManagerType {
    return this._post;
  }

  static async createPost(
    ownerId: string,
    post: PostCreate
  ): Promise<PostManager> {
    const newPost = await databaseClient.post.create({
      data: {
        id: IdGeneratorManager.generate().id,
        authorId: ownerId,
        cw: post.cw,
        body: post.body,
        isLocalOnly: post.isLocalOnly,
        visibility: post.visibility ?? PostVisibility.PUBLIC,
      },
      include: {
        author: {
          include: {
            host: true,
          },
        },
      },
    });

    return new PostManager(newPost);
  }

  static async fromId(id: string): Promise<PostManager | null> {
    const targetPost = await databaseClient.post.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          include: {
            host: true,
          },
        },
      },
    });

    if (targetPost === null) return null;
    return new PostManager(targetPost);
  }

  static async fromIdOrThrow(id: string): Promise<PostManager> {
    const targetPost = await PostManager.fromId(id);
    if (targetPost === null)
      throw new PostManagerError("Specified post id is not found.");
    return targetPost;
  }
}

export interface PostCreate {
  body?: string;
  cw?: string;
  isLocalOnly?: boolean;
  visibility?: PostVisibility;
}

export class PostManagerError extends Error {}
