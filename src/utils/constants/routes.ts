export const ROUTES = {
  ROOT: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGET_PASSWORD: "/forget-password",
  EMAIL_VERIFICATION: "/email-verification",
  RESET_PASSWORD: "/reset-password",

  QR_SCAN: "/scanner",
  MY_QR: "/qr",

  MAP: "/map",
  FEED: "/feed",

  PROFILE_SETUP: "/profile/setup",
  PROFILE_EDIT: "/profile/edit",
  PROFILE: (id: string) => `/profile/${id}` as const,

  STORE_REGISTER: "/store/register",
  STORE: (id: string) => `/store/${id}` as const,

  MAP_SOURCE: "/api/map-source",
  API: "/api",
};
