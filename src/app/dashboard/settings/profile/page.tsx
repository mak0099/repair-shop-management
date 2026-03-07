import { ProfileView } from "@/features/profile"

export const metadata = {
  title: "Profile Settings | Telefix POS",
  description: "Manage your personal information and security settings",
}

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProfileView />
    </div>
  )
}