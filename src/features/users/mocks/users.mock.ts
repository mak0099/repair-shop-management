import { User } from "../user.schema"
import { MOCK_USERS } from "@/features/auth/mocks/auth.mock"

const userData = [
  { name: "Super Admin", email: "admin@example.com", roleIds: ["role-admin", "role-manager"] },
  { name: "Manager Milano", email: "manager.milano@example.com", roleIds: ["role-manager"] },
  { name: "Technician Mario", email: "mario.rossi@example.com", roleIds: ["role-technician", "role-frontdesk"] },
  { name: "Frontdesk Luigi", email: "luigi.verdi@example.com", roleIds: ["role-frontdesk"] },
  { name: "Manager Roma", email: "manager.roma@example.com", roleIds: ["role-manager"] },
];

/**
 * Generates a list of mock users for the management system.
 * It synchronizes with existing Auth users and generates additional dummy data.
 */
const generateUsers = (count: number): User[] => {
  const users: User[] = [];

  // Sync with Auth users by mapping their new roleIds structure
  MOCK_USERS.forEach((u) => {
    users.push({
      id: u.id,
      name: u.name,
      email: u.email,
      roleIds: u.roleIds, // Using the updated array property
      extraPermissions: u.extraPermissions || [],
      isActive: u.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  })

  // Generate additional mock staff members
  for (let i = 0; i < count; i++) {
    const userInfo = userData[i % userData.length];
    const isDuplicate = i >= userData.length;
    
    // Calculate stable timestamps for mock data
    const baseDate = new Date();
    const createdDate = new Date(baseDate.getTime() - (count - i) * 24 * 60 * 60 * 1000);
    const updatedDate = new Date(baseDate.getTime() - (count - i) * 12 * 60 * 60 * 1000);

    users.push({
      id: `user-${String(100 + i).padStart(3, '0')}`,
      name: isDuplicate ? `${userInfo.name} ${Math.floor(i / userData.length) + 1}` : userInfo.name,
      email: isDuplicate ? `user${i}@example.com` : userInfo.email,
      roleIds: userInfo.roleIds,
      extraPermissions: [],
      isActive: i % 10 !== 0, // Randomly set some users as inactive
      createdAt: createdDate.toISOString(),
      updatedAt: updatedDate.toISOString(),
    });
  }
  return users;
};

export const mockUsers: User[] = generateUsers(15);