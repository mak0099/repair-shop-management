// src/mocks/handlers.ts
import { acceptanceHandlers } from "@/features/acceptances/mocks/acceptances.handlers";
import { attributeHandlers } from "@/features/attributes/mocks/attribute.handlers";
import { brandHandlers } from "@/features/brands/mocks/brands.handlers"; // Make sure this import is correct
import { customerHandlers } from "@/features/customers/mocks/customers.handlers";
import { itemHandlers } from "@/features/items/mocks/items.handlers"
import { modelHandlers } from "@/features/models/mocks/models.handlers"
import { masterSettingHandlers } from "@/features/master-settings/mocks/master-setting.handlers"
import { userHandlers } from "@/features/users/mocks/users.handlers"
import { categoryHandlers } from "@/features/categories/mocks/categories.handlers"
import { supplierHandlers } from "@/features/suppliers/mocks/suppliers.handlers"
import { expenseHandlers } from "@/features/expenses/mocks/expenses.handlers"

export const handlers = [
  ...acceptanceHandlers,
  ...attributeHandlers,
  ...customerHandlers,
  ...brandHandlers,
  ...itemHandlers,
  ...modelHandlers,
  ...masterSettingHandlers,
  ...userHandlers,
  ...categoryHandlers,
  ...supplierHandlers,
  ...expenseHandlers,
]
