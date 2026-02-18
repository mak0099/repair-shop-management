export const mockMasterSettings = [
    ...["Black", "White", "Titanium Gray", "Blue", "Red", "Green"].map(c => ({ type: 'COLOR', value: c, label: c })),
    ...["Charger", "Cable", "Case", "No accessories", "Original Box"].map(a => ({ type: 'ACCESSORY', value: a, label: a })),
    ...["SMARTPHONE", "TABLET", "LAPTOP", "DESKTOP", "OTHER"].map(d => ({ type: 'DEVICE_TYPE', value: d, label: d })),
    ...["IN REPAIR", "WAITING PARTS", "READY", "DELIVERED", "CANCELLED"].map(s => ({ type: 'REPAIR_STATUS', value: s, label: s })),
    ...["No Warranty", "3 Months", "6 Months", "12 Months", "Lifetime"].map(w => ({ type: 'WARRANTY', value: w, label: w })),
];