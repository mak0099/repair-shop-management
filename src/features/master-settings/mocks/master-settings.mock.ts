import { MasterSetting } from "../master-setting.schema"
import { SettingType } from "@/types/common";

const settingData: {type: SettingType, label: string, value: string}[] = [
  { type: "COLOR", label: "Deep Purple", value: "deep_purple" },
  { type: "COLOR", label: "Space Black", value: "space_black" },
  { type: "WARRANTY", label: "1 Year", value: "1_year" },
  { type: "WARRANTY", label: "2 Years", value: "2_years" },
  { type: "DEVICE_TYPE", label: "Smartphone", value: "smartphone" },
  { type: "DEVICE_TYPE", label: "Tablet", value: "tablet" },
  { type: "REPAIR_STATUS", label: "In Progress", value: "in_progress" },
  { type: "REPAIR_STATUS", label: "Completed", value: "completed" },
  { type: "CHECKLIST_ACCESSORY", label: "Charger", value: "charger" },
  { type: "CHECKLIST_ACCESSORY", label: "Box", value: "box" },
];

const generateMasterSettings = (count: number): MasterSetting[] => {
  const settings: MasterSetting[] = [];
  for (let i = 0; i < count; i++) {
    const settingInfo = settingData[i % settingData.length];
    settings.push({
      id: `setting-${String(100 + i).padStart(3, '0')}`,
      type: settingInfo.type,
      label: settingInfo.label,
      value: settingInfo.value,
      isActive: i % 10 !== 0,
      createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (count - i) * 12 * 60 * 60 * 1000).toISOString(),
    });
  }
  return settings;
};

export const mockMasterSettings: MasterSetting[] = generateMasterSettings(30);
