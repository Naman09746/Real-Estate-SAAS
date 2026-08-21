"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AuthCard } from "@/components/ui/auth-card";
import { 
  Building2, 
  Users, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  Check, 
  Sparkles,
  ShieldAlert
} from "lucide-react";

const TEAM_SIZES = [
  { id: "1-5", label: "1 - 5 Sales Reps", desc: "Boutique brokerage or luxury desk" },
  { id: "6-20", label: "6 - 20 Sales Reps", desc: "Fast-growing real estate agency" },
  { id: "21-50", label: "21 - 50 Sales Reps", desc: "Regional developer sales command" },
  { id: "50+", label: "50+ Enterprise Reps", desc: "Multi-city developer conglomerate" },
];

const REGIONS = [
  "NCR (Gurgaon, Delhi, Noida)",
  "Mumbai Metropolitan Region (MMR)",
  "Bangalore (Urban & North)",
  "Hyderabad (HITEC, Financial Dist)",
  "Pune (West & East)",
  "Goa & Alibaug Luxury",
  "Other Indian Metro",
];

export default function SetupOrgPage() {
  const router = useRouter();
  const { user, org, saveOrgSetup, workflowStep } = useAuth();

  const [orgName, setOrgName] = React.useState(org?.name || "Apex Realty Partners");
  const [teamSize, setTeamSize] = React.useState(org?.teamSize || "6-20");
  const [primaryRegion, setPrimaryRegion] = React.useState(org?.primaryRegion || REGIONS[0]);
  const [userRole, setUserRole] = React.useState("Founder / Sales Director");
  const [slug, setSlug] = React.useState("apex-realty");

  React.useEffect(() => {
    // Generate clean slug from name
    const generatedSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug || "my-org");
  }, [orgName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    saveOrgSetup({
      name: orgName.trim(),
      teamSize,
      primaryRegion,
    });

    router.push("/choose-plan");
  };

  return (
    <AuthCard
      currentStep="org"
      maxWidthClass="max-w-xl"
      title="Create your Real Estate Organization"
      subtitle="Set up your company workspace to unify your inventory, projects, and sales closers."
      footerContent="You can invite your team members and configure custom commission tiers in the next step."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Organization / Brokerage Name</span>
          </label>
          <input
            type="text"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. DLF Elite Partners, Apex Luxury Advisors"
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground font-medium"
          />
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
            <span>Workspace URL:</span>
            <span className="font-mono text-foreground font-medium bg-muted px-1.5 py-0.5 rounded text-[10px]">
              callcrm.in/{slug}
            </span>
          </div>
        </div>

        {/* Primary Operating Region */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Primary Operating Hub</span>
          </label>
          <select
            value={primaryRegion}
            onChange={(e) => setPrimaryRegion(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground font-medium"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Team Size Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Active Sales Team Size</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TEAM_SIZES.map((tier) => {
              const isSelected = teamSize === tier.id;
              return (
                <button
                  type="button"
                  key={tier.id}
                  onClick={() => setTeamSize(tier.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-xs text-foreground">{tier.label}</span>
                    {isSelected && (
                      <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{tier.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Role */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Your Role in Organization</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              "Founder / Boss",
              "Sales Director / VP",
              "Senior Sales Rep",
            ].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setUserRole(role)}
                className={`py-2 px-2 text-center text-xs font-medium rounded-lg border transition-all ${
                  userRole === role
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary-hover transition-all active:scale-[0.99] shadow-sm"
        >
          <span>Continue to Choose Plan & Payment</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </AuthCard>
  );
}
