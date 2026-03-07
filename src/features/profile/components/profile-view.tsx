"use client"

import { Loader2, Settings, AlertCircle } from "lucide-react"
import { ProfileForm } from "./profile-form"
import { Separator } from "@/components/ui/separator"
import { useGetProfile } from "../profile.api"

export function ProfileView() {
  // ১. সার্ভার থেকে লেটেস্ট প্রোফাইল ডাটা আনা
  const { data: user, isLoading, isError, error } = useGetProfile()

  if (isLoading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center opacity-40">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
        <p className="text-[11px] font-black uppercase tracking-widest">Loading Account Details...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-slate-900">Unable to load profile</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">{error?.message || "Something went wrong"}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        User session not found. Please log in again.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ২. প্রোফাইল হেডার ও ব্রেডক্রাম্ব টাইপ ডিজাইন */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-slate-400">
           <Settings className="h-3.5 w-3.5" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Account Settings</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Profile & Security</h2>
      </div>

      <Separator className="bg-slate-100" />

      {/* ৩. মেইন প্রোফাইল ফর্ম */}
      <ProfileForm user={user} />
    </div>
  )
}