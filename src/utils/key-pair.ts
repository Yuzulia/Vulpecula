import { generateKeyPair } from "crypto";

export async function generateKeyPairAsync(): Promise<KeyPairGenerate> {
  return await new Promise<KeyPairGenerate>((resolve, reject) => {
    generateKeyPair(
      "rsa",
      {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
          cipher: undefined,
          passphrase: undefined,
        },
      },
      (err, publicKey, privateKey) => {
        err !== null
          ? reject(err)
          : resolve({
              privateKey,
              publicKey,
            });
      }
    );
  });
}

export interface KeyPairGenerate {
  privateKey: string;
  publicKey: string;
}
