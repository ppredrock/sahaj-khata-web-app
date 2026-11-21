import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionDukandar = {
  id: string;
  storeName: string;
  ownerName: string;
  phone?: string | null;
  currency: string;
  isUnlocked: boolean;
};

export type SessionData = {
  dukandar?: SessionDukandar;
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "sahajkhata_secure_cookie_session_secret_32chars_min_2026",
  cookieName: "sahajkhata_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
