import { customAlphabet } from "nanoid";

const NANOID_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/*
    https://zelark.github.io/nano-id-cc/
    With the above alphabet and 14 characters at 1000 IDs per hour:
    ~32 thousand years or 277B IDs needed, in order to have a 1% probability of at least one collision.
   */
export function generateNanoId(prefix = "", length = 14): string {
  const nanoid = customAlphabet(NANOID_ALPHABET, length);
  return `${prefix ? prefix + "_" : ""}${nanoid()}`;
}
