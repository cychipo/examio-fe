import CryptoJS from "crypto-js";
import { env } from "@/lib/env";

// AES key from environment - MUST match backend key
const QUIZ_AES_KEY = env.quizAesKey;

/**
 * Decrypt quiz content using AES-256-CBC
 * Input format: iv.ciphertext (base64 encoded)
 * Returns the decrypted string (original question/options)
 */
export function decryptQuizContent(ciphertext: string): string {
  try {
    const [ivBase64, dataBase64] = ciphertext.split(".");

    if (!ivBase64 || !dataBase64) {
      console.error("Invalid ciphertext format");
      return "[Lỗi giải mã]";
    }

    // Parse IV and encrypted data
    const iv = CryptoJS.enc.Base64.parse(ivBase64);

    // Ensure key is exactly 32 bytes
    const keyString = QUIZ_AES_KEY.padEnd(32, "!").slice(0, 32);
    const key = CryptoJS.enc.Utf8.parse(keyString);

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      {
        ciphertext: CryptoJS.enc.Base64.parse(dataBase64),
      } as CryptoJS.lib.CipherParams,
      key,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return "[Lỗi giải mã]";
  }
}

/**
 * Decrypt quiz options (JSON array of strings)
 * Returns the original string array
 */
export function decryptQuizOptions(ciphertext: string): string[] {
  try {
    const decrypted = decryptQuizContent(ciphertext);
    return JSON.parse(decrypted) as string[];
  } catch (error) {
    console.error("Options decryption error:", error);
    return ["[Lỗi giải mã]"];
  }
}
