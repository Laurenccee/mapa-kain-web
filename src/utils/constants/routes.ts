export const ROUTES = {
  ROOT: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGET_PASSWORD: "/forget-password",
  EMAIL_VERIFICATION: "/email-verification",

  PROFILE_SETUP: "/profile/setup",
  QR_SCAN: "/qr-scan",
  MY_QR: "/my-qr",

  MAP: "/map",
  MAP_V2: "/map-v2",
  FEED: "/feed",
  USER: (id: string) => `/user/${id}` as const,

  MAP_SOURCE: "/api/map-source",
};
