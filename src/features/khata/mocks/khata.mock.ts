import { KhataEntry } from "../khata.schema"
import { mockSuppliers } from "@/features/suppliers"
import { mockCustomers } from "@/features/customers"

// ১. পার্টি পুল তৈরি করা (সাপ্লায়ার এবং কাস্টমার মিক্স করে)
const combinedParties = [
  ...mockSuppliers.slice(0, 3).map(s => ({ id: s.id, name: s.companyName, type: "SUPPLIER" as const })),
  ...mockCustomers.slice(0, 3).map(c => ({ id: c.id, name: c.name, type: "CUSTOMER" as const })),
  { id: null, name: "General Shop Expense", type: "SUPPLIER" as const } // ম্যানুয়াল খরচের জন্য
];

const generateKhataEntries = (count: number): KhataEntry[] => {
  const entries: KhataEntry[] = [];
  let runningBalance = 2500; // ইতালির শপের একটি বেজ ব্যালেন্স

  for (let i = 0; i < count; i++) {
    const party = combinedParties[i % combinedParties.length];
    const amount = Math.floor(Math.random() * 300) + 50;
    
    let type: string;
    let direction: "IN" | "OUT";

    // ২. পার্টি টাইপ অনুযায়ী লজিক সেট করা
    if (party.type === "SUPPLIER") {
      // সাপ্লায়ারের ক্ষেত্রে হয় মাল কেনা (IN - দেনা বাড়ছে) অথবা পেমেন্ট দেওয়া (OUT - দেনা কমছে)
      const isBill = i % 2 === 0;
      type = isBill ? "PURCHASE" : "PURCHASE_PAYMENT";
      direction = isBill ? "IN" : "OUT";
    } else {
      // কাস্টমারের ক্ষেত্রে হয় সেল/রিপেয়ার (OUT - পাওনা বাড়ছে) অথবা টাকা পাওয়া (IN - ক্যাশ ঢুকছে)
      const isInvoice = i % 2 === 0;
      type = isInvoice ? "SALE" : "SALE_DUE_PAYMENT";
      direction = isInvoice ? "OUT" : "IN";
    }

    // ৩. রানিন ব্যালেন্স ক্যালকুলেশন (সিম্পল মক লজিক)
    runningBalance = direction === "IN" ? runningBalance + amount : runningBalance - amount;

    entries.push({
      id: `trx-${2000 + i}`,
      partyId: party.id || "",
      partyName: party.name,
      partyType: party.type, // নতুন ফিল্ড যোগ করা হলো
      type: type,
      direction: direction,
      amount: amount,
      balanceAfter: runningBalance,
      date: new Date(Date.now() - (count - i) * 10 * 60 * 60 * 1000).toISOString(),
      paymentMethod: i % 4 === 0 ? "CARD" : "CASH",
      referenceId: party.type === "SUPPLIER" ? `PUR-IT-${500 + i}` : `INV-IT-${800 + i}`,
      note: i % 3 === 0 ? "Verified by Arif" : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return entries.reverse(); // লেটেস্ট ট্রানজেকশন সবার আগে
};

export const mockKhataEntries: KhataEntry[] = generateKhataEntries(20);