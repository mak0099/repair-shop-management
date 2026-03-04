"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import type { RegisterLog, RegisterFormValues } from "./register.schema"

/**
 * Register Log API Hooks
 * Endpoint: "registers"
 */
const registerApiHooks = createApiHooksFor<RegisterLog, RegisterFormValues, Partial<RegisterFormValues>>("registers")

export const useRegisters = registerApiHooks.useGetList
export const useRegister = registerApiHooks.useGetOne
export const useCreateRegister = registerApiHooks.useCreate // To Open Register
export const useUpdateRegister = registerApiHooks.useUpdate // To Close Register
export const useDeleteRegister = registerApiHooks.useDelete