import crypto from "crypto";
import bcrypt from "bcrypt";

//creat e a URL safe hex random token
export function makeRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

//hash the raw token for db storage
export function hashToken(rawToken) {
  return bcrypt.hash(rawToken, 10);
}

//verify the hashed raw token and the URL recieved token
export const verifyHashedToken = (rawToken, storedhashToken) =>
  bcrypt.compare(rawToken, storedhashToken);

//setup time settings for token expiration: minutes and hours
export function minutesFromNow(mins) {
  return new Date(Date.now() + mins * 60 * 1000);
}

export function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
