import { http, HttpResponse } from 'msw'
import { MOCK_USERS } from './auth.mock'
import { LoginFormValues } from '../auth.schema'

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json() as LoginFormValues
    const { email, password } = body
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password)

    if (user) {
      const { password, ...userWithoutPassword } = user
      return HttpResponse.json(userWithoutPassword)
    }

    return new HttpResponse(null, { status: 401, statusText: 'Invalid credentials' })
  })
]