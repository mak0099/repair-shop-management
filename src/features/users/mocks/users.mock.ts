import { User, UserFormValues } from "../user.schema"

const userData: {name: string, email: string, role: UserFormValues['role'], branch_id: string}[] = [
  { name: "Super Admin", email: "admin@example.com", role: "ADMIN", branch_id: "branch-100" },
  { name: "Manager Milano", email: "manager.milano@example.com", role: "MANAGER", branch_id: "branch-100" },
  { name: "Technician Mario", email: "mario.rossi@example.com", role: "TECHNICIAN", branch_id: "branch-100" },
  { name: "Frontdesk Luigi", email: "luigi.verdi@example.com", role: "FRONTDESK", branch_id: "branch-100" },
  { name: "Manager Roma", email: "manager.roma@example.com", role: "MANAGER", branch_id: "branch-101" },
];

const generateUsers = (count: number): User[] => {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const userInfo = userData[i % userData.length];
    const isDuplicate = i >= userData.length;
    users.push({
      id: `user-${String(100 + i).padStart(3, '0')}`,
      name: isDuplicate ? `${userInfo.name} ${Math.floor(i / userData.length) + 1}` : userInfo.name,
      email: isDuplicate ? `user${i}@example.com` : userInfo.email,
      role: userInfo.role,
      branch_id: userInfo.branch_id,
      isActive: i % 10 !== 0,
      createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (count - i) * 12 * 60 * 60 * 1000).toISOString(),
    });
  }
  return users;
};

export const mockUsers: User[] = generateUsers(15);
