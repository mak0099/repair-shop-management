import { delay, http, HttpResponse } from "msw"
import { mockRegisters } from "./register.mock"
import { RegisterLog, RegisterFormValues } from "../register.schema"
import { REGISTER_STATUS } from "../register.constants"

let registers = [...mockRegisters];

export const registerHandlers = [
  /**
   * Get All Register Sessions
   */
  http.get("*/registers", async () => {
    await delay(500);
    return HttpResponse.json({
      data: registers,
      meta: { total: registers.length }
    });
  }),

  /**
   * Open New Register (Create)
   */
  http.post("*/registers", async ({ request }) => {
    await delay(800);
    const data = (await request.json()) as RegisterFormValues;
    
    const newRegister: RegisterLog = {
      ...data,
      id: `reg-${Date.now()}`,
      sessionNumber: `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: REGISTER_STATUS.OPEN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as RegisterLog;
    
    registers.unshift(newRegister);
    return HttpResponse.json(newRegister, { status: 201 });
  }),

  /**
   * Close Register (Update)
   */
  http.patch("*/registers/:id", async ({ params, request }) => {
    await delay(800);
    const { id } = params;
    const data = (await request.json()) as Partial<RegisterFormValues>;
    
    const index = registers.findIndex(r => r.id === id);
    if (index !== -1) {
      registers[index] = { 
        ...registers[index], 
        ...data, 
        updatedAt: new Date().toISOString() 
      } as RegisterLog;
      
      return HttpResponse.json(registers[index]);
    }
    
    return new HttpResponse(null, { status: 404 });
  }),

  /**
   * Delete Session
   */
  http.delete("*/registers/:id", async ({ params }) => {
    await delay(400);
    const { id } = params;
    registers = registers.filter(r => r.id !== id);
    return new HttpResponse(null, { status: 204 });
  })
];