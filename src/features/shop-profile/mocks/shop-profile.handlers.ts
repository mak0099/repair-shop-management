import { http, HttpResponse } from "msw";
import { shopProfileMock } from "./shop-profile.mock";
import { ShopProfile } from "../shop-profile.schema";

let profile: ShopProfile | null = { ...shopProfileMock };

export const shopProfileHandlers = [
  // Get shop profile
  http.get("*/shop-profile/:id", ({ params }) => {
    // We check for 'current' as the ID for this singleton resource
    if (!profile || params.id !== "current") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(profile);
  }),

  // Create shop profile
  http.post<never, ShopProfile>("*/shop-profile", async ({ request }) => {
    const newProfile = await request.json();
    profile = { ...newProfile, id: "shop-001" }; // Assign a mock ID
    return HttpResponse.json(profile, { status: 201 });
  }),

  // Update shop profile
  http.patch<{ id: string }, Partial<ShopProfile>>(
    "*/shop-profile/:id",
    async ({ request, params }) => {
      if (!profile || profile.id !== params.id) {
        return new HttpResponse(null, { status: 404 });
      }
      const updates = await request.json();
      profile = { ...profile, ...updates };
      return HttpResponse.json(profile);
    }
  ),
];
