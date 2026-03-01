import { delay, http, HttpResponse } from "msw";
import { Attribute } from "../attribute.schema";
import { mockAttributes } from "./attribute.mock";

// Mutable state for the mock session
const attributes = [...mockAttributes];

export const attributeHandlers = [
  // GET all attributes (Categories with their values)
  http.get("*/attributes", async () => {
    await delay(500);
    return HttpResponse.json({
      data: attributes,
      meta: {
        total: attributes.length,
        page: 1,
        pageSize: 100,
        totalPages: 1,
      },
    });
  }),

  // GET a single attribute category by ID
  http.get("*/attributes/:id", async ({ params }) => {
    const { id } = params;
    const attribute = attributes.find((a) => a.id === id);
    
    if (!attribute) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(attribute);
  }),

  // PATCH: Update values for a specific attribute category (e.g., Add new Color)
  http.patch("*/attributes/:id", async ({ params, request }) => {
    try {
      await delay(500);
      const { id } = params;
      const data = (await request.json()) as Partial<Attribute>;
      const attributeIndex = attributes.findIndex((a) => a.id === id);

      if (attributeIndex === -1) {
        return HttpResponse.json(
          { message: "Attribute category not found" },
          { status: 404 }
        );
      }

      // Merge new values or data
      const updatedAttribute = {
        ...attributes[attributeIndex],
        ...data,
      };

      // In case we are adding new values, we ensure they have IDs
      if (data.values) {
        updatedAttribute.values = data.values.map(v => ({
          ...v,
          id: v.id || `v-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        }));
      }

      attributes[attributeIndex] = updatedAttribute;

      return HttpResponse.json(updatedAttribute, { status: 200 });
    } catch (e) {
      const error = e as Error;
      return HttpResponse.json(
        { message: "MSW Handler Error", error: error.message },
        { status: 500 }
      );
    }
  }),

  // DELETE: Logic to remove a value from a category (Optional implementation)
  http.delete("*/attributes/:id/values/:valueId", async ({ params }) => {
    const { id, valueId } = params;
    const attributeIndex = attributes.findIndex((a) => a.id === id);

    if (attributeIndex !== -1) {
      attributes[attributeIndex].values = attributes[attributeIndex].values.filter(
        (v) => v.id !== valueId
      );
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),
];