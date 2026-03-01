import { LoginFormValues } from "./auth.schema"
import { User } from "./auth-context"
import { apiClient } from "@/lib/api-client"

export const loginWithEmailAndPassword = async (data: LoginFormValues): Promise<User> => {
  const response = await apiClient.post<User>('/auth/login', data)
  return response.data
}