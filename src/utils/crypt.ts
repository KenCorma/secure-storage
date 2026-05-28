import CryptoJS from "crypto-js";
import { mainConfig,DEFAULT_SECRET } from "./config";


export const encrypt = (value: string) => {
  const secret = mainConfig.secret;
  if (secret === DEFAULT_SECRET) console.warn('Secret is default! Please Change')
  try {
    if (typeof value !== "string") {
      throw new Error("Value must be string");
    }
    const str = CryptoJS.AES.encrypt(value, secret).toString();
    return str;
  } catch (err) {
    console.error("Error secure storage => encrypt :", err);
    return null;
  }
};

export const decrypt = (value: string) => {
  const secret = mainConfig.secret;
  if (secret === DEFAULT_SECRET) console.warn('Secret is default! Please Change');
  try {
    if (typeof value !== "string") {
      console.warn("Value is not string")
      return null
    }
    const str = CryptoJS.AES.decrypt(value, secret).toString(CryptoJS.enc.Utf8);
    return str;
  } catch (err) {
    console.error("Error secure storage => decrypt :", err);
    return null;
  }
};
