// src/services/config.ts

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  useMock: process.env.NEXT_PUBLIC_USE_MOCK === "true",
};
