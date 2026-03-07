"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ProfileFormValues, PasswordChangeValues } from "./profile.schema";
import { User } from "@/features/users/user.schema";

export function useGetProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await axios.get<User>("/api/profile/me");
      return response.data;
    },
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await axios.patch("/api/profile/update", data);
      return response.data;
    },
    onSuccess: () => {
      // প্রোফাইল আপডেট হলে ক্যাশ রিফ্রেশ করা
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] }); // যদি গ্লোবাল auth স্টেট থাকে
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: PasswordChangeValues) => {
      const response = await axios.post("/api/profile/change-password", data);
      return response.data;
    },
  });
}