import { LoginFormValues, User } from "./auth.schema"
import { api } from "@/lib/api-client"

export const loginWithEmailAndPassword = async (data: LoginFormValues): Promise<User> => {
  const response = await api.post<User>('/auth/login', data)
  return response.data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}