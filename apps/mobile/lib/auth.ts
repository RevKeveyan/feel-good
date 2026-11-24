import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

const SITE_URL_HINT =
  "In Supabase → Authentication → URL Configuration set Site URL to feelgood://auth/callback and remove bare https://….supabase.co from Redirect URLs (keep only …/auth/v1/callback).";

const OAUTH_CALLBACK_URL = "feelgood://auth/callback";
const OAUTH_RESET_URL = "feelgood://auth/reset";

let lastOAuthRedirectTo = "";
let lastOAuthRedirectParam: string | null = null;
let passwordRecoveryPending = false;

export function isPasswordRecoveryPending() {
  return passwordRecoveryPending;
}

export function markPasswordRecoveryPending() {
  passwordRecoveryPending = true;
}

export function clearPasswordRecoveryPending() {
  passwordRecoveryPending = false;
}

export function getOAuthRedirectTo() {
  return lastOAuthRedirectTo || OAUTH_CALLBACK_URL;
}

export function getResetRedirectTo() {
  return OAUTH_RESET_URL;
}

export function getLastOAuthRedirectParam() {
  return lastOAuthRedirectParam;
}

function isSupabaseHostedAuthLanding(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co");
  } catch {
    return url.includes(".supabase.co");
  }
}

function isAuthCallbackDeepLink(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("auth/callback") ||
    lower.includes("auth/reset") ||
    parseAuthCallbackUrl(url).access_token != null
  );
}

export function parseAuthCallbackUrl(url: string): {
  access_token: string | null;
  refresh_token: string | null;
  type: string | null;
} {
  const hashIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const hashParams = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
  const queryParams =
    queryIndex >= 0 ? url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined) : "";
  const params = new URLSearchParams(hashParams || queryParams);
  if (hashParams && queryParams) {
    const query = new URLSearchParams(queryParams);
    for (const [key, value] of query.entries()) {
      if (!params.has(key)) params.set(key, value);
    }
  }
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    type: params.get("type"),
  };
}

export async function completeSessionFromUrl(url: string) {
  const { access_token, refresh_token } = parseAuthCallbackUrl(url);
  if (!access_token || !refresh_token) {
    const lower = url.toLowerCase();
    if (lower.includes("requested path is invalid") || lower.includes("required path is invalid")) {
      throw new Error(
        `OAuth redirect failed (path is invalid). ${SITE_URL_HINT}\nApp redirectTo: ${getOAuthRedirectTo()}\nOAuth redirect_to param: ${lastOAuthRedirectParam ?? "(none)"}`,
      );
    }
    if (isSupabaseHostedAuthLanding(url)) {
      throw new Error(
        `OAuth landed on Supabase Site URL without tokens. ${SITE_URL_HINT}\nApp redirectTo: ${getOAuthRedirectTo()}\nOAuth redirect_to param: ${lastOAuthRedirectParam ?? "(none)"}`,
      );
    }
    throw new Error("Auth callback missing tokens");
  }
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
}

export class EmailNotConfirmedError extends Error {
  readonly code = "email_not_confirmed" as const;
  constructor() {
    super("Confirm your email first. Check your inbox for the one-time code.");
    this.name = "EmailNotConfirmedError";
  }
}

export function isEmailNotConfirmedError(e: unknown): e is EmailNotConfirmedError {
  return (
    e instanceof EmailNotConfirmedError ||
    (e instanceof Error &&
      (e.message.toLowerCase().includes("email not confirmed") ||
        e.message.toLowerCase().includes("not confirmed")))
  );
}

export class EmailAlreadyRegisteredError extends Error {
  readonly code = "email_already_registered" as const;
  constructor() {
    super("An account with this email already exists. Sign in instead.");
    this.name = "EmailAlreadyRegisteredError";
  }
}

function isAlreadyRegisteredMessage(message: string) {
  const msg = message.toLowerCase();
  return (
    msg.includes("already registered") ||
    msg.includes("already been registered") ||
    msg.includes("already exists") ||
    msg.includes("user already")
  );
}

export function isEmailAlreadyRegisteredError(e: unknown): e is EmailAlreadyRegisteredError {
  if (e instanceof EmailAlreadyRegisteredError) return true;
  if (!(e instanceof Error)) return false;
  if ("code" in e && (e as { code?: string }).code === "email_already_registered") return true;
  return isAlreadyRegisteredMessage(e.message);
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
      throw new EmailNotConfirmedError();
    }
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) {
    if (isAlreadyRegisteredMessage(error.message)) {
      throw new EmailAlreadyRegisteredError();
    }
    throw error;
  }
  if (data.user && !data.session && (data.user.identities?.length ?? 0) === 0) {
    throw new EmailAlreadyRegisteredError();
  }
  return { hasSession: Boolean(data.session) };
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: OAUTH_RESET_URL,
  });
  if (error) throw error;
}

export async function verifyRecoveryOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: "recovery",
  });
  if (error) throw error;
  if (!data.session) {
    throw new Error("Code verified but no session was created. Request a new code and try again.");
  }
  markPasswordRecoveryPending();
  return data.session;
}

export async function verifySignupOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: "signup",
  });
  if (error) throw error;
  if (!data.session) {
    throw new Error("Code verified but no session was created. Request a new code and try again.");
  }
  clearPasswordRecoveryPending();
  return data.session;
}

export async function resendSignupConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("Your reset session expired. Enter a new one-time code, then set your password.");
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  clearPasswordRecoveryPending();
}

async function openAuthSessionWithLinkingFallback(authUrl: string, redirectTo: string) {
  let settled = false;
  const linkHandle: { remove: (() => void) | undefined } = { remove: undefined };

  const linkPromise = new Promise<string>((resolve) => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (settled || !isAuthCallbackDeepLink(url)) return;
      settled = true;
      sub.remove();
      linkHandle.remove = undefined;
      resolve(url);
    });
    linkHandle.remove = () => sub.remove();
  });

  try {
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
    if (result.type === "success" && result.url) {
      settled = true;
      linkHandle.remove?.();
      linkHandle.remove = undefined;
      return result.url;
    }

    const initialUrl = await Linking.getInitialURL();
    if (initialUrl && isAuthCallbackDeepLink(initialUrl)) {
      settled = true;
      linkHandle.remove?.();
      linkHandle.remove = undefined;
      return initialUrl;
    }

    const linked = await Promise.race([
      linkPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 800)),
    ]);
    if (linked) return linked;

    throw new Error(
      `Google sign in cancelled or redirect did not return to the app. ${SITE_URL_HINT}\nApp redirectTo: ${redirectTo}\nOAuth redirect_to param: ${lastOAuthRedirectParam ?? "(none)"}`,
    );
  } finally {
    linkHandle.remove?.();
    linkHandle.remove = undefined;
  }
}

export const GOOGLE_SIGN_IN_ENABLED = false;

export async function signInWithGoogle() {
  if (!GOOGLE_SIGN_IN_ENABLED) {
    throw new Error("Google Sign In is disabled");
  }
  const oauthRedirectTo = OAUTH_CALLBACK_URL;
  lastOAuthRedirectTo = oauthRedirectTo;
  lastOAuthRedirectParam = null;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: oauthRedirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error("No OAuth URL returned");

  try {
    lastOAuthRedirectParam = new URL(data.url).searchParams.get("redirect_to");
  } catch {
    lastOAuthRedirectParam = null;
  }

  if (__DEV__) {
    console.log("[auth] oauthRedirectTo", oauthRedirectTo);
    console.log("[auth] supabase redirect_to param", lastOAuthRedirectParam);
  }

  const callbackUrl = await openAuthSessionWithLinkingFallback(data.url, oauthRedirectTo);
  await completeSessionFromUrl(callbackUrl);
}

export const APPLE_SIGN_IN_ENABLED = true;

async function createAppleNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const bytes = Crypto.getRandomBytes(32);
  const rawNonce = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );
  return { rawNonce, hashedNonce };
}

export async function signInWithApple() {
  if (!APPLE_SIGN_IN_ENABLED) {
    throw new Error("Apple Sign In is disabled");
  }
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign In is only available on iOS");
  }
  const { rawNonce, hashedNonce } = await createAppleNonce();
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) {
    throw new Error("No identity token from Apple");
  }
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
}

export async function signOut() {
  clearPasswordRecoveryPending();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export { getOAuthRedirectTo as redirectTo, getResetRedirectTo as resetRedirectTo };
