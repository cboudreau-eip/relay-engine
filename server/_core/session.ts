import { ONE_YEAR_MS } from "../../shared/const";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

const getSecret = () =>
  new TextEncoder().encode(ENV.cookieSecret || "dev-secret-change-in-production");

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ ok: true })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return payload.ok === true;
  } catch {
    return false;
  }
}
