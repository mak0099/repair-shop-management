"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Mail, Phone, Lock, ShieldCheck, Save, Loader2, KeyRound, BadgeCheck } from "lucide-react"
import { toast } from "sonner"

import { Form } from "@/components/ui/form"
import { TextField } from "@/components/forms/text-field"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { 
  profileSchema, 
  passwordChangeSchema, 
  ProfileFormValues, 
  PasswordChangeValues 
} from "../profile.schema"
import { useUpdateProfile, useUpdatePassword } from "../profile.api"
import { User as UserType } from "@/features/users/user.schema"

export function ProfileForm({ user }: { user: UserType }) {
  // ১. API Hooks
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile()
  const { mutate: updatePassword, isPending: isUpdatingPassword } = useUpdatePassword()

  // ২. প্রোফাইল ফর্ম (General Info)
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  })

  // ৩. পাসওয়ার্ড ফর্ম (Security)
  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // ডাটা রিফ্রেশ হলে ফর্ম রিসেট করা
  useEffect(() => {
    if (user) profileForm.reset({ name: user.name, email: user.email, phone: user.phone || "" })
  }, [user, profileForm])

  // প্রোফাইল সাবমিট লজিক
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfile(data, {
      onSuccess: () => toast.success("Profile information updated!"),
      onError: (err: any) => toast.error(err?.message || "Failed to update profile"),
    })
  }

  // পাসওয়ার্ড সাবমিট লজিক
  const onPasswordSubmit = (data: PasswordChangeValues) => {
    updatePassword(data, {
      onSuccess: () => {
        toast.success("Security credentials updated!")
        passwordForm.reset() // পাসওয়ার্ড রিসেট করা জরুরি
      },
      onError: (err: any) => toast.error(err?.message || "Failed to change password"),
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header with User Quick Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 text-3xl font-black">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {user?.roles?.map((role) => (
                <Badge key={role.id} variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] uppercase px-2">
                  <BadgeCheck className="mr-1 h-3 w-3" /> {role.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl mb-8 inline-flex border border-slate-200/50">
          <TabsTrigger value="general" className="flex items-center gap-2 px-8 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <User className="h-4 w-4" /> 
            <span className="text-[11px] font-black uppercase tracking-widest">General Info</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 px-8 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <Lock className="h-4 w-4" /> 
            <span className="text-[11px] font-black uppercase tracking-widest">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* --- General Tab --- */}
        <TabsContent value="general" className="focus-visible:outline-none">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-50">
              <ShieldCheck className="h-4 w-4 text-slate-900" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Personal Details</h3>
            </div>
            
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <TextField 
                    control={profileForm.control} 
                    name="name" 
                    label="Full Name" 
                    placeholder="Enter your name"
                    icon={<User className="h-4 w-4 text-slate-400" />} 
                  />
                  <TextField 
                    control={profileForm.control} 
                    name="email" 
                    label="Email Address" 
                    placeholder="name@company.com"
                    icon={<Mail className="h-4 w-4 text-slate-400" />} 
                  />
                  <TextField 
                    control={profileForm.control} 
                    name="phone" 
                    label="Phone Number" 
                    placeholder="+39 XXX XXX XXXX"
                    icon={<Phone className="h-4 w-4 text-slate-400" />} 
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUpdatingProfile} className="bg-slate-900 hover:bg-slate-800 h-11 px-10 rounded-xl font-bold transition-all shadow-lg shadow-slate-200/50">
                    {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>

        {/* --- Security Tab --- */}
        <TabsContent value="security" className="focus-visible:outline-none">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm max-w-2xl">
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-50">
              <KeyRound className="h-4 w-4 text-rose-500" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Update Credentials</h3>
            </div>
            
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <TextField 
                  control={passwordForm.control} 
                  name="currentPassword" 
                  label="Current Password" 
                  type="password" 
                  placeholder="••••••••"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField 
                    control={passwordForm.control} 
                    name="newPassword" 
                    label="New Password" 
                    type="password" 
                    placeholder="Min. 6 chars"
                  />
                  <TextField 
                    control={passwordForm.control} 
                    name="confirmPassword" 
                    label="Confirm New Password" 
                    type="password" 
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={isUpdatingPassword} className="w-full md:w-auto bg-slate-900 hover:bg-black h-11 px-10 rounded-xl font-bold transition-all">
                    {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}