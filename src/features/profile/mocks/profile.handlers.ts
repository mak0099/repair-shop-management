import { delay, http, HttpResponse } from "msw"
import { User } from "@/features/auth/auth.schema"
import { MOCK_USERS } from "@/features/auth/mocks/auth.mock"
import { mockRoles } from "@/features/roles/mocks/roles.mock"

// Local mock state
// We extend User to include the extra fields that might be present in the mock but not in the base User type
interface MockUser extends User {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roles: any[];
  createdAt: string;
  updatedAt: string;
}

// Use the first user from MOCK_USERS as the logged-in user (Admin)
const { ...defaultUser } = MOCK_USERS[0];

let mockUserProfile: MockUser = {
  ...defaultUser,
  phone: defaultUser.phone || "+880 1700 000000",
  roles: defaultUser.roleIds.map(roleId => 
    mockRoles.find(r => r.id === roleId)
  ).filter(Boolean),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const profileHandlers = [
  // Get Current Profile
  http.get("*/api/profile/me", async () => {
    await delay(500)
    return HttpResponse.json(mockUserProfile)
  }),

  // Update Profile Info
  http.patch("*/api/profile/update", async ({ request }) => {
    await delay(800)
    const data = (await request.json()) as Partial<User>
    
    mockUserProfile = { ...mockUserProfile, ...data, updatedAt: new Date().toISOString() }
    
    return HttpResponse.json(mockUserProfile)
  }),

  // Change Password
  http.post("*/api/profile/change-password", async () => {
    await delay(1000)
    return HttpResponse.json({ success: true, message: "Password updated successfully" })
  }),
]