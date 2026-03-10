"use client"

import { createApiHooksFor } from "@/lib/api-factory";
import { ShopProfile } from "./shop-profile.schema";

// Define API hooks for the ShopProfile resource using the factory
const shopProfileApiHooks = createApiHooksFor<ShopProfile, ShopProfile, Partial<ShopProfile>>("shop-profile");

export function useShopProfile() {
  // The 'current' identifier is used for singleton resources like a shop profile
  return shopProfileApiHooks.useGetOne("current", {
    staleTime: 1000 * 60 * 10,  // 10 minutes
    gcTime: 1000 * 60 * 30,     // 30 minutes (formerly cacheTime)
  });
}

export const useCreateShopProfile = shopProfileApiHooks.useCreate;
export const useUpdateShopProfile = shopProfileApiHooks.useUpdate;
