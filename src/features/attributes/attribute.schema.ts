import { z } from "zod";

export const attributeValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Value is required"),
  isActive: z.boolean().default(true),
});

export const attributeSchema = z.object({
  id: z.string(),
  name: z.string(), 
  key: z.string(), // যেমন: "RAM", "ROM", "COLOR", "GRADE"
  values: z.array(attributeValueSchema),
  description: z.string().optional(),
});

export type Attribute = z.infer<typeof attributeSchema>;
export type AttributeValue = z.infer<typeof attributeValueSchema>;