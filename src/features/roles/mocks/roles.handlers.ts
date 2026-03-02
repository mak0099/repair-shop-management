import { delay, http, HttpResponse } from "msw";
import { applySort } from "@/mocks/mock-utils";
import { Role, RoleFormValues } from "../role.schema";
import { mockRoles } from "./roles.mock";

let roles = [...mockRoles];

export const roleHandlers = [
  // GET all roles with search and pagination
  http.get("*/roles", async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const sort = url.searchParams.get("_sort");
    const order = url.searchParams.get("_order");

    const filteredData = roles.filter((role) => 
      role.name.toLowerCase().includes(search) || 
      role.slug.toLowerCase().includes(search)
    );

    const sortedData = applySort(filteredData, sort, order);

    return HttpResponse.json({
      data: sortedData,
      meta: {
        total: sortedData.length,
        page: 1,
        pageSize: sortedData.length,
        totalPages: 1
      }
    });
  }),

  // GET role options (for Select dropdowns in User Form)
  http.get("*/roles/options", async () => {
    await delay(200);
    const options = roles
      .filter(r => r.isActive)
      .map(r => ({ id: r.id, name: r.name, slug: r.slug }));
    return HttpResponse.json(options);
  }),

  // GET a single role by ID
  http.get("*/roles/:id", ({ params }) => {
    const { id } = params;
    const role = roles.find(r => r.id === id);
    if (!role) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(role);
  }),

  // POST a new role
  http.post("*/roles", async ({ request }) => {
    await delay(800);
    const data = (await request.json()) as RoleFormValues;
    
    const newRole: Role = {
      id: `role-${Date.now()}`,
      ...data,
      isSystem: false, // User created roles are never system roles
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    roles.unshift(newRole);
    return HttpResponse.json(newRole, { status: 201 });
  }),

  // PATCH (Update) a role
  http.patch("*/roles/:id", async ({ params, request }) => {
    await delay(800);
    const { id } = params;
    const updates = (await request.json()) as Partial<RoleFormValues>;

    let updatedRole: Role | undefined;
    roles = roles.map((role) => {
      if (role.id === id) {
        updatedRole = { ...role, ...updates, updatedAt: new Date().toISOString() };
        return updatedRole;
      }
      return role;
    });

    if (!updatedRole) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(updatedRole);
  }),

  // DELETE a role (Prevent deleting system roles)
  http.delete("*/roles/:id", ({ params }) => {
    const { id } = params;
    const roleToDelete = roles.find(r => r.id === id);

    if (roleToDelete?.isSystem) {
      return HttpResponse.json(
        { message: "System roles cannot be deleted." }, 
        { status: 403 }
      );
    }

    roles = roles.filter((r) => r.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];