import { User } from "../user.schema";

export const mockUsers: Pick<User, "id" | "name">[] = [
    { id: 'tech-01', name: 'John Technician' },
    { id: 'tech-02', name: 'Jane Repair' },
    { id: 'tech-03', name: 'Peter Fixit' },
];