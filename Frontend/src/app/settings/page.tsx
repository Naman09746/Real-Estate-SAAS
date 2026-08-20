"use client";

import * as React from "react";
import { Settings as SettingsIcon, Save, Shield, Database, Bell, CheckCircle2 } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { currentUser } = useCRM();
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Organization & CRM Settings
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure organization branding, multi-tenant security, and pipeline stage parameters.
          </p>
        </div>

        {saved && (
          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Settings Saved
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <Card className="p-5 space-y-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-bold">Organization Profile</CardTitle>
            <CardDescription className="text-xs">
              Primary entity information used for customer communication and billing
            </CardDescription>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Organization Name</label>
              <Input defaultValue="Apex Realty Advisors Pvt. Ltd." />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Tenant Domain / Slug</label>
              <Input defaultValue="apex-realty.callcrm.in" disabled className="bg-secondary/50 font-mono" />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-bold">Default Currency & Timezone</CardTitle>
            <CardDescription className="text-xs">
              Standard format for budget inputs and lead follow-up reminders
            </CardDescription>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Primary Currency</label>
              <Input defaultValue="INR (₹ Indian Rupee - Lakhs & Crores)" disabled className="bg-secondary/50" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Timezone</label>
              <Input defaultValue="Asia/Kolkata (IST +5:30)" disabled className="bg-secondary/50" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
