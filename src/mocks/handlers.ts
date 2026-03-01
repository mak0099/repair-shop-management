// src/mocks/handlers.ts
import { acceptanceHandlers } from "@/features/acceptances/mocks/acceptances.handlers";
import { attributeHandlers } from "@/features/attributes/mocks/attribute.handlers";
import { brandHandlers } from "@/features/brands/mocks/brands.handlers"; // Make sure this import is correct
import { boxNumberHandlers } from "@/features/box-numbers/mocks/box-numbers.handlers";
import { categoryHandlers } from "@/features/categories/mocks/categories.handlers"
import { customerHandlers } from "@/features/customers/mocks/customers.handlers";
import { expenseHandlers } from "@/features/expenses/mocks/expenses.handlers"
import { itemHandlers } from "@/features/items/mocks/items.handlers"
import { masterSettingHandlers } from "@/features/master-settings/mocks/master-setting.handlers"
import { modelHandlers } from "@/features/models/mocks/models.handlers"
import { permissionHandlers } from "@/features/permissions/mocks/permissions.handlers"
import { stockAdjustmentHandlers } from "@/features/stock-adjustment/mocks/stock-adjustment.handlers";
import { stockHandlers } from "@/features/stock/mocks/stock.handlers";
import { supplierHandlers } from "@/features/suppliers/mocks/suppliers.handlers"
import { userHandlers } from "@/features/users/mocks/users.handlers"
import { shopProfileHandlers } from "@/features/shop-profile/mocks/shop-profile.handlers";
import { invoiceSetupHandlers } from "@/features/invoice-setup/mocks/invoice-setup.handlers";
import { authHandlers } from "@/features/auth";

export const handlers = [
  ...permissionHandlers,
  ...acceptanceHandlers,
  ...attributeHandlers,
  ...boxNumberHandlers,
  ...customerHandlers,
  ...brandHandlers,
  ...itemHandlers,
  ...modelHandlers,
  ...masterSettingHandlers,
  ...userHandlers,
  ...categoryHandlers,
  ...supplierHandlers,
  ...expenseHandlers,
  ...stockHandlers,
  ...stockAdjustmentHandlers,
  ...shopProfileHandlers,
  ...invoiceSetupHandlers,
  ...authHandlers
]
