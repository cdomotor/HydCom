import CryptoJS from 'crypto-js';

const SECRET_KEY = 'hydcom-secret-key';

export function encryptString(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decryptString(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
