export const PERMISSIONS = {
  // --- ITEM & MASTER DATA ---
  ITEMS_VIEW: "items.view",
  ITEMS_CREATE: "items.create",
  ITEMS_EDIT: "items.edit",
  ITEMS_DELETE: "items.delete",
  ITEMS_BULK_IMPORT: "items.bulk_import",
  
  CATEGORIES_MANAGE: "categories.manage",
  BRANDS_MANAGE: "brands.manage",
  MODELS_MANAGE: "models.manage",
  ATTRIBUTES_MANAGE: "attributes.manage",
  MASTER_SETTINGS_MANAGE: "master_settings.manage",

  // --- STOCK & INVENTORY ---
  STOCK_VIEW: "stock.view",
  STOCK_ADJUST: "stock.adjust",
  STOCK_TRANSFER_SEND: "stock.transfer_send",
  STOCK_TRANSFER_RECEIVE: "stock.transfer_receive",
  STOCK_LOW_ALERT_VIEW: "stock.low_alert_view",
  BOX_NUMBERS_MANAGE: "box_numbers.manage",
  IMEI_HISTORY_VIEW: "imei.history_view",

  // --- REPAIR & SERVICE WORKFLOW ---
  REPAIR_VIEW_ALL: "repair.view_all",
  REPAIR_VIEW_ASSIGNED: "repair.view_assigned",
  REPAIR_CREATE: "repair.create",
  REPAIR_EDIT: "repair.edit",
  REPAIR_CANCEL: "repair.cancel",
  REPAIR_ASSIGN_TECH: "repair.assign_tech",
  REPAIR_PERFORM: "repair.perform", // Technical Role Identifier
  REPAIR_STATUS_UPDATE: "repair.status_update",
  REPAIR_SPARE_PARTS_USE: "repair.spare_parts_use",
  REPAIR_DELIVER: "repair.deliver",
  REPAIR_WARRANTY_MANAGE: "repair.warranty_manage",

  // --- SALES & POS ---
  POS_ACCESS: "pos.access",
  SALES_VIEW_ALL: "sales.view_all",
  SALES_CREATE: "sales.create",
  SALES_EDIT_PRICE: "sales.edit_price", // Manual price override during sale
  SALES_DISCOUNT_APPLY: "sales.discount_apply",
  SALES_VOID_CANCEL: "sales.void_cancel",
  SALES_RETURN: "sales.return",
  SALES_PRINT_INVOICE: "sales.print_invoice",

  // --- CONTACTS ---
  SUPPLIERS_MANAGE: "suppliers.manage",
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_MANAGE: "customers.manage",
  CUSTOMER_CREDIT_LIMIT_EDIT: "customers.credit_limit_edit",

  // --- ACCOUNTS & FINANCIALS ---
  CASH_BOOK_VIEW: "accounts.cash_book_view",
  BANK_ACCOUNTS_VIEW: "accounts.bank_accounts_view",
  MOBILE_BANKING_VIEW: "accounts.mobile_banking_view", // bKash, Nagad
  EXPENSE_VIEW: "accounts.expense_view",
  EXPENSE_CREATE: "accounts.expense_create",
  KHATA_VIEW: "accounts.khata_view",
  KHATA_SETTLE: "accounts.khata_settle",
  SUPPLIER_PAYMENT: "accounts.supplier_payment",

  // --- REPORTS ---
  REPORT_SALES_SUMMARY: "report.sales_summary",
  REPORT_PROFIT_LOSS: "report.profit_loss",
  REPORT_STOCK_VALUATION: "report.stock_valuation",
  REPORT_EXPENSE_SUMMARY: "report.expense_summary",
  REPORT_TECH_PERFORMANCE: "report.tech_performance",
  REPORT_AUDIT_LOGS: "report.audit_logs",

  // --- SYSTEM & ADMIN ---
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
  BRANCH_MANAGE: "branch.manage",
  SHOP_PROFILE_EDIT: "settings.shop_profile",
  BACKUP_RESTORE: "settings.backup_restore",
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const PERMISSION_GROUPS = [
  {
    name: "Inventory & Products",
    permissions: [
      PERMISSIONS.ITEMS_VIEW, PERMISSIONS.ITEMS_CREATE, PERMISSIONS.ITEMS_EDIT, 
      PERMISSIONS.ITEMS_DELETE, PERMISSIONS.CATEGORIES_MANAGE, PERMISSIONS.BRANDS_MANAGE,
      PERMISSIONS.MODELS_MANAGE, PERMISSIONS.ATTRIBUTES_MANAGE
    ]
  },
  {
    name: "Stock Management",
    permissions: [
      PERMISSIONS.STOCK_VIEW, PERMISSIONS.STOCK_ADJUST, PERMISSIONS.STOCK_TRANSFER_SEND, 
      PERMISSIONS.STOCK_TRANSFER_RECEIVE, PERMISSIONS.BOX_NUMBERS_MANAGE, PERMISSIONS.IMEI_HISTORY_VIEW
    ]
  },
  {
    name: "Repair Service",
    permissions: [
      PERMISSIONS.REPAIR_VIEW_ALL, PERMISSIONS.REPAIR_VIEW_ASSIGNED, PERMISSIONS.REPAIR_CREATE, 
      PERMISSIONS.REPAIR_ASSIGN_TECH, PERMISSIONS.REPAIR_PERFORM, PERMISSIONS.REPAIR_STATUS_UPDATE,
      PERMISSIONS.REPAIR_SPARE_PARTS_USE, PERMISSIONS.REPAIR_DELIVER
    ]
  },
  {
    name: "Sales & POS",
    permissions: [
      PERMISSIONS.POS_ACCESS, PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_VIEW_ALL, 
      PERMISSIONS.SALES_DISCOUNT_APPLY, PERMISSIONS.SALES_EDIT_PRICE, PERMISSIONS.SALES_RETURN
    ]
  },
  {
    name: "Accounts & Khata",
    permissions: [
      PERMISSIONS.CASH_BOOK_VIEW, PERMISSIONS.KHATA_VIEW, PERMISSIONS.KHATA_SETTLE, 
      PERMISSIONS.EXPENSE_CREATE, PERMISSIONS.SUPPLIER_PAYMENT
    ]
  },
  {
    name: "Administration",
    permissions: [
      PERMISSIONS.USERS_MANAGE, PERMISSIONS.ROLES_MANAGE, PERMISSIONS.BRANCH_MANAGE, 
      PERMISSIONS.SHOP_PROFILE_EDIT, PERMISSIONS.REPORT_PROFIT_LOSS
    ]
  }
];