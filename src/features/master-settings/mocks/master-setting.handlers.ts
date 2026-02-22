import { delay, http, HttpResponse } from "msw";
import { MasterSetting } from "../master-setting.schema";
import { mockMasterSettings } from "./master-setting.mock";

// Mutable state for the mock session
let masterSettings = [...mockMasterSettings];

export const masterSettingHandlers = [
  // GET all master settings
  http.get("*/master-settings", async () => {
    await delay(500);
    return HttpResponse.json(masterSettings);
  }),

  // GET a single master setting category by ID
  http.get("*/master-settings/:id", async ({ params }) => {
    const { id } = params;
    const setting = masterSettings.find((m) => m.id === id);
    
    if (!setting) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(setting);
  }),

  // PATCH: Update values for a specific master setting (e.g., Add new Payment Method)
  http.patch("*/master-settings/:id", async ({ params, request }) => {
    try {
      await delay(500);
      const { id } = params;
      const data = (await request.json()) as Partial<MasterSetting>;
      const settingIndex = masterSettings.findIndex((m) => m.id === id);

      if (settingIndex === -1) {
        return HttpResponse.json(
          { message: "Master setting category not found" },
          { status: 404 }
        );
      }

      // Merge new values or data
      const updatedSetting = {
        ...masterSettings[settingIndex],
        ...data,
      };

      // Ensure new values have unique IDs
      if (data.values) {
        updatedSetting.values = data.values.map(v => ({
          ...v,
          id: v.id || `m-v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
        }));
      }

      masterSettings[settingIndex] = updatedSetting;

      return HttpResponse.json(updatedSetting, { status: 200 });
    } catch (e) {
      const error = e as Error;
      return HttpResponse.json(
        { message: "MSW Handler Error", error: error.message },
        { status: 500 }
      );
    }
  }),

  // DELETE: Remove a specific value from a master setting category
  http.delete("*/master-settings/:id/values/:valueId", async ({ params }) => {
    const { id, valueId } = params;
    const settingIndex = masterSettings.findIndex((m) => m.id === id);

    if (settingIndex !== -1) {
      masterSettings[settingIndex].values = masterSettings[settingIndex].values.filter(
        (v) => v.id !== valueId
      );
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),
];