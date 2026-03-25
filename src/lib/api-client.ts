import axios from "axios";
import { config } from "./config";

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000, // ১০ সেকেন্ডের বেশি সময় নিলে রিকোয়েস্ট ক্যান্সেল হবে (Vercel-এর জন্য ভালো)
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Next.js-এ সার্ভার সাইড এবং ক্লায়েন্ট সাইড চেক করা নিরাপদ
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // গ্লোবাল এরর মেসেজ বা টোস্ট (Toast) দেখানোর জন্য এটি সেরা জায়গা
    const message = error.response?.data?.message || error.message || "Something went wrong";
    
    // আপনি এখানে সরাসরি 'sonner' বা অন্য টোস্ট লাইব্রেরি কল করতে পারেন
    // toast.error(message); 

    return Promise.reject(error);
  }
);