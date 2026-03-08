"use client"

import Image from "next/image"
import { Building2, Mail, Phone, MapPin, Globe, CreditCard, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShopProfile } from "../shop-profile.api";

interface ShopProfileViewProps {
  onEdit: () => void;
}

export function ShopProfileView({ onEdit }: ShopProfileViewProps) {
  const { data: profile, isLoading } = useShopProfile();

  if (isLoading) return <div>Loading Profile...</div>;
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shop Profile Not Set</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">Your shop profile has not been set up yet. Please set it up to continue.</p>
          <Button onClick={onEdit}>Setup Profile</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 mb-4 overflow-hidden">
              {profile.logoUrl ? (
                <Image src={profile.logoUrl} alt="Logo" fill className="object-cover" />
              ) : (
                <Building2 className="h-12 w-12 text-slate-400" />
              )}
            </div>
            <h3 className="text-xl font-bold">{profile.name}</h3>
            {profile.slogan && <p className="text-sm text-muted-foreground italic">{profile.slogan}</p>}
            <p className="text-sm text-muted-foreground">{profile.ownerName}</p>
            <Badge className="mt-2" variant="outline">{profile.currency}</Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Business Details</CardTitle>
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> Contact Number
              </p>
              <p className="text-sm font-medium">{profile.phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email Address
              </p>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Address
              </p>
              <p className="text-sm font-medium">{profile.address}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> BIN/Trade License
              </p>
              <p className="text-sm font-medium">{profile.binNumber || "Not Set"}</p>
            </div>
            {profile.website && (
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Website
                </p>
                <p className="text-sm font-medium text-blue-600">{profile.website}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                 <span className="text-xs text-muted-foreground">Currency</span>
                 <span className="text-sm font-medium">{profile.currency}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                 <span className="text-xs text-muted-foreground">Default Tax Rate</span>
                 <span className="text-sm font-medium">{profile.taxRate ? `${profile.taxRate}%` : "N/A"}</span>
              </div>
              <div>
                 <p className="text-xs text-muted-foreground mb-1">Bank Details:</p>
                 <p className="text-sm whitespace-pre-wrap text-slate-700">{profile.bankAccountInfo || "Not Set"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                 <p className="text-xs text-muted-foreground mb-1">Invoice Footer:</p>
                 <p className="text-sm italic text-slate-600">{profile.invoiceFooterMessage || "Not Set"}</p>
               </div>
               <div>
                 <p className="text-xs text-muted-foreground mb-1">Return Policy:</p>
                 <p className="text-xs text-slate-600 line-clamp-3">{profile.returnPolicy || "Not Set"}</p>
               </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}