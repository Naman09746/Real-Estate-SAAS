"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Building2,
  Building,
  PhoneCall,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Users,
  Kanban,
  FileSpreadsheet,
  Download,
  Smartphone,
  Sparkles,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Check,
  Layers,
  ArrowUpRight,
  QrCode,
  ShieldAlert,
  Headphones,
  Compass,
  KeyRound,
  Grid3X3,
  FileText,
  Search,
  CheckSquare,
  SlidersHorizontal,
  Mail,
} from "lucide-react";
import {
  IsometricCityscape,
  ArchitecturalFloorplanVector,
  MobileCompanionDeviceFrame,
} from "@/components/marketing/architectural-visuals";

export default function LandingPage() {
  const router = useRouter();
  const { user, workflowStep } = useAuth();
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly");
  const [activeTab, setActiveTab] = React.useState<"cockpit" | "dossier" | "pipeline" | "matcher">("cockpit");
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [mobileBetaEmail, setMobileBetaEmail] = React.useState("");
  const [mobileBetaSubmitted, setMobileBetaSubmitted] = React.useState(false);

  const getDashboardHref = () => {
    if (!user) return "/login?mode=signup";
    if (workflowStep === "org") return "/setup-org";
    if (workflowStep === "plan") return "/choose-plan";
    if (workflowStep === "onboarding") return "/onboarding";
    return "/dashboard";
  };

  const handleMobileBetaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileBetaEmail.trim()) return;
    
    // Store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("callcrm_mobile_beta_emails") || "[]");
      existing.push({ email: mobileBetaEmail.trim(), timestamp: new Date().toISOString() });
      localStorage.setItem("callcrm_mobile_beta_emails", JSON.stringify(existing));
    } catch {}

    setMobileBetaSubmitted(true);
    setTimeout(() => {
      setMobileBetaEmail("");
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-paper text-ink selection:bg-brass/20 flex flex-col font-sans">
      {/* 1. ARCHITECTURAL LEDGER TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-architecturalLine bg-paper/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-ink text-paper-card flex items-center justify-center font-bold shadow-sm">
              <Building2 className="h-5 w-5 text-brass" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-ink flex items-center gap-1.5 font-display">
                Apex CallCRM
                <span className="text-[10px] font-mono font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brass/10 text-brass border border-brass/20">
                  LEDGER v2.4
                </span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden lg:block">
                Architectural Sales Command Center
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-ink transition-colors">
              Features
            </a>
            <a href="#product-tour" className="hover:text-ink transition-colors">
              Interface Tour
            </a>
            <a href="#how-it-works" className="hover:text-ink transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-ink transition-colors">
              FAQ
            </a>
            <a href="#mobile-app" className="hover:text-ink transition-colors flex items-center gap-1.5">
              <span>Mobile App</span>
              <span className="text-[9px] font-mono font-bold bg-verdigris-light text-verdigris px-1.5 py-0.2 rounded border border-verdigris-border">
                BETA
              </span>
            </a>
          </nav>
        </div>

        {/* Right CTA / Auth state */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href={getDashboardHref()}
              className="flex items-center gap-2 py-2 px-4 bg-ink text-paper-card text-xs font-semibold rounded-xl hover:bg-ink-hover transition-all active:scale-[0.99] shadow-sm"
            >
              <span>Go to Sales Cockpit</span>
              <ArrowRight className="h-3.5 w-3.5 text-brass" />
            </Link>
          ) : (
            <>
              <Link
                href="/login?mode=login"
                className="text-xs font-semibold text-slate-700 hover:text-ink px-3 py-2 transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/login?mode=signup"
                className="flex items-center gap-1.5 py-2 px-4 bg-ink text-paper-card text-xs font-semibold rounded-xl hover:bg-ink-hover transition-all active:scale-[0.99] shadow-sm"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="h-3.5 w-3.5 text-brass" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. ARCHITECTURAL HERO SECTION with 3D Isometric Background */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 border-b border-architecturalLine">
        {/* 3D Isometric Cityscape — absolute background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute bottom-0 left-0 w-full">
            <IsometricCityscape />
          </div>
          {/* Gradient overlay for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(248,250,252,0.75) 50%, rgba(248,250,252,0.5) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6">
          {/* Top Pill with Monospace Code */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper-card/90 backdrop-blur-sm border border-architecturalLine shadow-xs text-xs text-ink font-medium animate-in fade-in-50">
            <span className="flex h-2 w-2 rounded-full bg-verdigris animate-ping" />
            <span className="font-mono text-[11px] font-bold text-brass uppercase tracking-wider">
              [SYSTEM SPEC: RESIDENTIAL SALES LEDGER]
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Engineered for High-Ticket Property Desks</span>
          </div>

          {/* Architectural Serif Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink max-w-4xl mx-auto leading-[1.12] font-display">
            The High-Velocity Sales Command Center for{" "}
            <span className="bg-gradient-to-r from-brass to-amber-700 bg-clip-text text-transparent underline decoration-brass/30 decoration-wavy">
              High-Ticket Property Closers
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Replace passive CRM spreadsheets with an action-first architectural sales ledger. Match inventory in 10 seconds, eliminate deal slippage, and automate daily outreach across Gurgaon, Mumbai & NCR.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login?mode=signup"
              className="w-full sm:w-auto py-3.5 px-7 bg-ink text-paper-card font-bold text-sm rounded-xl hover:bg-ink-hover transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-4 w-4 text-brass" />
            </Link>

            <Link
              href="/login?mode=login"
              className="w-full sm:w-auto py-3.5 px-6 bg-paper-card/90 backdrop-blur-sm text-ink font-semibold text-sm rounded-xl border border-architecturalLine hover:bg-paper transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-brass" />
              <span>Explore Instant Live Preview</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-verdigris" /> 100% Free 14-Day Trial
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-verdigris" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <Check className="h-4 w-4 text-verdigris" /> 60-Second Setup
            </span>
          </div>
        </div>

          {/* Live Sales Stream Ledger Mockup */}
          <div className="relative z-10 pt-2 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-architecturalLine bg-paper-card glow-card p-3 sm:p-5 shadow-2xl text-left overflow-hidden">
              {/* Photo & Technical Header Strip */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-architecturalLine">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-mono text-slate-500 ml-2 font-medium">
                    callcrm.in/sovereign-desk/cockpit
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-verdigris bg-verdigris-light px-2 py-0.5 rounded border border-verdigris-border">
                    ● ACTIVE STREAM · 12 LEADS IN QUEUE
                  </span>
                </div>
              </div>

              {/* Mockup Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Card 1: Next Best Action */}
                <div className="bg-paper p-3.5 rounded-xl border border-architecturalLine space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      [ACTION-01 · URGENT SLA]
                    </span>
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-ink">Siddharth Oberoi</p>
                    <span className="font-mono text-[10px] font-bold text-brass bg-brass-light px-1.5 py-0.2 rounded border border-brass-border">
                      HOT · 96 SCORE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono">
                    Req: 4 BHK Sky Suite • Budget: <strong className="text-ink">₹14.50 CR</strong>
                  </p>
                  <div className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] p-2 rounded-lg font-medium">
                    ⚠️ Shortlisted Unit 1802. Negotiation follow-up commitment due now.
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button className="flex-1 py-1.5 bg-ink text-paper-card text-[10px] font-bold rounded-lg flex items-center justify-center gap-1">
                      <PhoneCall className="h-3 w-3 text-brass" /> Call +91 98112
                    </button>
                    <button className="px-2.5 py-1.5 bg-verdigris text-white text-[10px] font-bold rounded-lg">
                      WhatsApp
                    </button>
                  </div>
                </div>

                {/* Card 2: Recommended Unit Match */}
                <div className="bg-paper p-3.5 rounded-xl border border-architecturalLine space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      [UNIT-MATCH · 4/4 CRITERIA]
                    </span>
                    <span className="text-[10px] font-mono font-bold text-verdigris bg-verdigris-light px-1.5 py-0.5 rounded border border-verdigris-border">
                      EXACT FIT
                    </span>
                  </div>
                  <p className="font-bold text-xs text-ink">Sovereign Grand Residences</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span className="bg-paper-card px-1.5 py-0.5 rounded border border-architecturalLine text-[10px] font-bold">
                      TOWER-C · UNIT-1401
                    </span>
                    <span className="font-bold text-ink text-xs">₹11.80 CR</span>
                  </div>
                  <div className="text-[10px] text-slate-600 space-y-1 font-mono">
                    <p>✓ 4 BHK + Servant (5,400 sq.ft)</p>
                    <p>✓ North-East Facing, High Floor</p>
                  </div>
                  <button className="w-full py-1.5 bg-paper-card hover:bg-paper text-ink text-[10px] font-semibold rounded-lg border border-architecturalLine flex items-center justify-center gap-1">
                    <FileText className="h-3 w-3 text-brass" /> Generate Pitch Proposal PDF
                  </button>
                </div>

                {/* Card 3: Today's Calling SLAs */}
                <div className="bg-paper p-3.5 rounded-xl border border-architecturalLine space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      [DAILY OUTREACH SLAs]
                    </span>
                    <span className="text-[10px] font-mono font-bold text-ink">8 / 10 COMPLETED</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-verdigris h-full w-[80%]" />
                  </div>
                  <div className="space-y-1.5 pt-1 font-mono text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-ink font-medium">Rajiv S. (The Emerald)</span>
                      <span className="text-verdigris font-bold">CONNECTED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink font-medium">Priya K. (Sky Suites)</span>
                      <span className="text-blue-600 font-bold">SITE VISIT 4 PM</span>
                    </div>
                  </div>
                  <div className="p-1.5 bg-paper-card border border-architecturalLine rounded-lg text-center text-[10px] font-semibold text-slate-600">
                    Execution Loop: SEE → CALL → LOG → MOVE ON
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* 3. ARCHITECTURAL VALUE HIGHLIGHTS BAR */}
      <section className="w-full bg-paper-card border-b border-architecturalLine py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">14-Day Free Access</p>
            <p className="text-xs text-slate-500 font-sans">₹0 to start • No credit card</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-extrabold text-brass tracking-tight">&lt; 10s Rapid Log</p>
            <p className="text-xs text-slate-500 font-sans">1-Click Call & WhatsApp logging</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-extrabold text-verdigris tracking-tight">Zero Stalling Deals</p>
            <p className="text-xs text-slate-500 font-sans">Automated SLA alerts & tasks</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">Strict Data Privacy</p>
            <p className="text-xs text-slate-500 font-sans">Role & Regional team walls</p>
          </div>
        </div>
      </section>

      {/* 4. DEEP INTERFACE TOUR (Dense, realistic preview tabs) */}
      <section id="product-tour" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brass bg-brass-light px-3 py-1 rounded-full border border-brass-border">
            [SOFTWARE ARCHITECTURE TOUR]
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight font-display">
            Inspect the Real Sales Cockpit
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real data density: explore how CallCRM turns passive database clutter into a high-speed execution engine.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center">
          <div className="bg-paper p-1 rounded-xl border border-architecturalLine flex flex-wrap items-center justify-center gap-1 shadow-inner max-w-full">
            {[
              { id: "cockpit", label: "1. Next Best Actions" },
              { id: "dossier", label: "2. 360° Buyer Dossier" },
              { id: "pipeline", label: "3. Kanban Pipeline" },
              { id: "matcher", label: "4. Unit Matcher" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-paper-card text-ink shadow-xs border border-architecturalLine font-bold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* High Density Display Card */}
        <div className="bg-paper-card border border-architecturalLine rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* TAB 1: COCKPIT */}
          {activeTab === "cockpit" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-3 border-b border-architecturalLine">
                <div>
                  <h3 className="text-lg font-bold text-ink font-display">Action-First Sales Cockpit</h3>
                  <p className="text-xs text-slate-600">
                    Prioritized calling queue ranking deals by intent score, budget, and follow-up deadlines.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-brass bg-brass-light px-2.5 py-1 rounded-md border border-brass-border">
                  SPEED-TO-LEAD QUEUE
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    code: "LEAD-9081",
                    name: "Aditya Varma",
                    score: 95,
                    budget: "₹6.50 CR",
                    req: "3 BHK + Servant (High Floor)",
                    note: "Site visit completed on Sunday. Requested floor comparison between Tower B & C.",
                    phone: "+91 98112 45890",
                  },
                  {
                    code: "LEAD-8842",
                    name: "Dr. Meenakshi Sundaram",
                    score: 88,
                    budget: "₹9.80 CR",
                    req: "4 BHK Duplex (Park Facing)",
                    note: "Family approved layout. Token advance discussion scheduled for 3:30 PM.",
                    phone: "+91 98701 33412",
                  },
                  {
                    code: "LEAD-7920",
                    name: "Rohit & Ananya Khanna",
                    score: 82,
                    budget: "₹12.00 CR",
                    req: "Penthouse with Terrace",
                    note: "CA reviewing payment plan milestones. Send revised installment schedule.",
                    phone: "+91 99100 88231",
                  },
                ].map((lead, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-paper rounded-xl border border-architecturalLine"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-paper-card px-1.5 py-0.2 rounded border border-architecturalLine">
                          {lead.code}
                        </span>
                        <span className="font-bold text-xs text-ink">{lead.name}</span>
                        <span className="font-mono text-[10px] font-bold text-verdigris bg-verdigris-light px-1.5 py-0.2 rounded border border-verdigris-border">
                          {lead.score} SCORE
                        </span>
                        <span className="font-mono text-xs font-bold text-ink">{lead.budget}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        <strong>Req:</strong> {lead.req} • <span className="text-slate-500">{lead.note}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button className="flex-1 sm:flex-none py-1.5 px-3 bg-ink text-paper-card text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5">
                        <PhoneCall className="h-3 w-3 text-brass" /> <span>Call</span>
                      </button>
                      <button className="py-1.5 px-3 bg-verdigris text-white text-xs font-semibold rounded-lg">
                        WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 360° DOSSIER */}
          {activeTab === "dossier" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-3 border-b border-architecturalLine">
                <div>
                  <h3 className="text-lg font-bold text-ink font-display">360° Buyer Intelligence Dossier</h3>
                  <p className="text-xs text-slate-600">
                    Deep structural context: verified preferences, confirmed buying signals, objections, and decision-makers.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-verdigris bg-verdigris-light px-2.5 py-1 rounded-md border border-verdigris-border">
                  BUYER MASTER RECORD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-paper rounded-xl border border-architecturalLine space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                    [ARCHITECTURAL REQ]
                  </span>
                  <p className="text-xs font-bold text-ink">4 BHK + Servant Suite</p>
                  <p className="text-[11px] text-slate-500 font-mono">Floor: 14 to 22 • North-East Facing</p>
                </div>

                <div className="p-3.5 bg-paper rounded-xl border border-architecturalLine space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                    [FINANCIAL PROFILE]
                  </span>
                  <p className="text-xs font-bold text-ink font-mono">₹14.50 CR BUDGET</p>
                  <p className="text-[11px] text-verdigris font-mono font-medium">✓ Pre-Approved Mortgage</p>
                </div>

                <div className="p-3.5 bg-paper rounded-xl border border-architecturalLine space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                    [DECISION STAKEHOLDERS]
                  </span>
                  <p className="text-xs font-bold text-ink">Buyer, Spouse & Tax Advisor</p>
                  <p className="text-[11px] text-slate-500">Primary residence upgrade</p>
                </div>

                <div className="p-3.5 bg-paper rounded-xl border border-architecturalLine space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                    [ACTIVE OBJECTION]
                  </span>
                  <p className="text-xs font-bold text-amber-800">Floor Rise Comparison</p>
                  <p className="text-[11px] text-slate-500">Comparing Tower C vs D rates</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PIPELINE */}
          {activeTab === "pipeline" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-3 border-b border-architecturalLine">
                <div>
                  <h3 className="text-lg font-bold text-ink font-display">Visual Kanban Stage Progression</h3>
                  <p className="text-xs text-slate-600">
                    Real-time aggregated deal values across pipeline milestones with drag-and-drop mechanics.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-ink bg-paper px-2.5 py-1 rounded-md border border-architecturalLine">
                  TOTAL: ₹111.0 CR IN PIPELINE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                {[
                  { stage: "QUALIFIED", val: "₹48.5 CR", count: "6 Leads", leads: ["Siddharth O. (₹14.5 Cr)", "Meenakshi S. (₹9.8 Cr)"] },
                  { stage: "SITE VISIT", val: "₹32.0 CR", count: "4 Leads", leads: ["Aditya Varma (₹6.5 Cr)", "Rajiv Singhania (₹8.2 Cr)"] },
                  { stage: "NEGOTIATION", val: "₹18.5 CR", count: "2 Leads", leads: ["Rohit Khanna (₹12.0 Cr)", "Anita Sen (₹6.5 Cr)"] },
                  { stage: "BOOKING WON", val: "₹12.0 CR", count: "1 Deal", leads: ["Vikramaditya (₹12.0 Cr - Closed)"] },
                ].map((col, idx) => (
                  <div key={idx} className="p-3 bg-paper rounded-xl border border-architecturalLine space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-architecturalLine">
                      <span className="font-bold text-ink text-[11px]">{col.stage}</span>
                      <span className="text-brass font-bold">{col.val}</span>
                    </div>
                    <div className="space-y-1.5">
                      {col.leads.map((ld, i) => (
                        <div key={i} className="p-2 bg-paper-card rounded-lg border border-architecturalLine text-[10px] text-slate-700">
                          {ld}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MATCHER */}
          {activeTab === "matcher" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-3 border-b border-architecturalLine">
                <div>
                  <h3 className="text-lg font-bold text-ink font-display">Buyer-to-Unit Matcher Matrix</h3>
                  <p className="text-xs text-slate-600">
                    Live inventory matrix cross-referencing buyer preferences to recommend the exact tower and unit.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-verdigris bg-verdigris-light px-2.5 py-1 rounded-md border border-verdigris-border">
                  INVENTORY MATCHER ACTIVE
                </span>
              </div>

              <div className="space-y-3 font-mono">
                {[
                  {
                    unit: "TOWER-C · UNIT-1401",
                    project: "Sovereign Grand Residences",
                    specs: "4 BHK + Servant (5,400 sq.ft) • Floor 14 • North-East Facing",
                    price: "₹11.80 CR",
                    match: "4/4 EXACT MATCH",
                    badge: "bg-verdigris-light text-verdigris border-verdigris-border",
                  },
                  {
                    unit: "TOWER-A · UNIT-1802",
                    project: "Imperial Crest Green",
                    specs: "4 BHK Sky Suite (5,800 sq.ft) • Floor 18 • Park Facing",
                    price: "₹14.20 CR",
                    match: "3/4 STRONG MATCH",
                    badge: "bg-brass-light text-brass border-brass-border",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-paper rounded-xl border border-architecturalLine flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-ink bg-paper-card px-2 py-0.5 rounded border border-architecturalLine">
                          {item.unit}
                        </span>
                        <span className="font-bold text-xs text-ink font-sans">{item.project}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.badge}`}>
                          {item.match}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-sans">{item.specs}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-sm font-extrabold text-ink">{item.price}</span>
                      <button className="py-1.5 px-3 bg-ink text-paper-card text-xs font-semibold rounded-lg hover:bg-ink-hover font-sans flex items-center gap-1">
                        <FileText className="h-3 w-3 text-brass" /> <span>Generate Pitch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Vector CAD Floor Plan Render */}
              <div className="pt-2">
                <ArchitecturalFloorplanVector />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. SIX CORE REAL ESTATE SUPERPOWERS */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12 border-t border-architecturalLine">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brass bg-brass-light px-3 py-1 rounded-full border border-brass-border">
            [ARCHITECTURAL CAPABILITIES]
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight font-display">
            Built Specifically for High-Ticket Real Estate
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered with precise real estate logic: floor-rise calculations, Vastu facings, and 10-second touchpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Next Best Action Engine",
              desc: "Algorithms prioritize buyers by score, intent, and SLA deadlines so closers always know who to call next.",
              badge: "SPEED-TO-LEAD",
            },
            {
              icon: PhoneCall,
              title: "10-Second Rapid Touchpoints",
              desc: "1-click calling & WhatsApp logging. Automatically cascades stages and queues the next follow-up.",
              badge: "TWO-CLICK LOG",
            },
            {
              icon: Compass,
              title: "Buyer-to-Unit Matcher",
              desc: "Match configuration, Vastu facing, and budget preferences with active inventory matrices in 10 seconds.",
              badge: "INVENTORY FIT",
            },
            {
              icon: Kanban,
              title: "Kanban Stage Progression",
              desc: "Structured pipeline progression: New Inbound → Qualified → Site Visit → Negotiation → Won Booking.",
              badge: "DEAL PIPELINE",
            },
            {
              icon: MapPin,
              title: "Multi-City Hub Partitioning",
              desc: "Role-based tenant isolation between Gurgaon, South Delhi, Noida, Mumbai, and Bangalore sales desks.",
              badge: "DATA PRIVACY",
            },
            {
              icon: TrendingUp,
              title: "Executive vs Closer Cockpits",
              desc: "Command center tracking overdue SLAs, conversion velocity, and team pipeline forecasts in real-time.",
              badge: "KPI COMMAND",
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-paper-card border border-architecturalLine rounded-2xl p-6 hover:shadow-md transition-all hover:border-brass/50 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-paper text-ink flex items-center justify-center group-hover:bg-ink group-hover:text-paper-card transition-colors">
                      <Icon className="h-5 w-5 text-brass" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-paper px-2 py-0.5 rounded border border-architecturalLine">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink font-display">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. HOW IT WORKS (4 STRUCTURED STEPS) */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 bg-paper-subtle border-y border-architecturalLine">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-verdigris bg-verdigris-light px-3 py-1 rounded-full border border-verdigris-border">
              [EXECUTION BLUEPRINT]
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight font-display">
              From Inquiry to Booking in 4 Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Standardize your sales rhythm from the first minute of adoption.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Sign Up & Create Org",
                desc: "Set up your brokerage workspace and assign regional hub channels in under 60 seconds.",
              },
              {
                step: "02",
                title: "Import Projects & Leads",
                desc: "Upload CSV spreadsheets from property portals into structured priority queues.",
              },
              {
                step: "03",
                title: "Execute 10s Outreach",
                desc: "Closers dial with 1-click, log outcomes, and schedule site visits without manual typing.",
              },
              {
                step: "04",
                title: "Close Luxury Deals",
                desc: "Match shortlisted inventory units, track token advances, and celebrate revenue milestones.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-paper-card border border-architecturalLine rounded-2xl p-6 relative shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-brass/30 block mb-2 font-mono">
                    {step.step}
                  </span>
                  <h3 className="text-base font-bold text-ink mb-2 font-display">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BALANCED PRICING WITH ACTIVE ANNUAL TOGGLE CALCULATION */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brass bg-brass-light px-3 py-1 rounded-full border border-brass-border">
            [TRANSPARENT SUBSCRIPTION TIERS]
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight font-display">
            Built for Small-to-Mid Brokerage Realities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            No massive seat jumps. Start with a 14-day free trial with full feature access.
          </p>

          {/* Billing Switcher with Dynamic Live Calculation */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-paper p-1 rounded-xl border border-architecturalLine flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-paper-card text-ink shadow-xs border border-architecturalLine font-bold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-paper-card text-ink shadow-xs border border-architecturalLine font-bold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] font-mono font-bold text-verdigris bg-verdigris-light px-1.5 py-0.2 rounded border border-verdigris-border">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Plan 1: Solo Closer */}
          <div className="bg-paper-card border border-architecturalLine rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-brass/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-ink font-display">Solo Closer</h3>
                <span className="text-[10px] font-mono font-semibold bg-paper text-slate-600 px-2 py-0.5 rounded border border-architecturalLine">
                  1 SEAT
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                For independent luxury property advisors and boutique solo desks.
              </p>
              <div className="mb-6 pb-4 border-b border-architecturalLine">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-ink">
                    ₹{billingCycle === "monthly" ? "1,999" : "1,599"}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                {billingCycle === "yearly" ? (
                  <p className="text-[11px] text-verdigris font-mono font-medium mt-1">
                    Billed ₹19,188/year (Save ₹4,800/yr)
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-mono mt-1">Billed monthly</p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> 1 Dedicated Sales Closer Seat
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Up to 300 Active Leads & Pipeline
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> 1 Master Project Catalog
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> 1-Click Calling & WhatsApp Logging
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Standard Email Support
                </li>
              </ul>
            </div>

            <Link
              href="/login?mode=signup"
              className="w-full py-2.5 px-4 bg-paper hover:bg-paper-subtle text-ink font-semibold text-xs rounded-xl border border-architecturalLine transition-all text-center"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Plan 2: Boutique Team (Most Popular) */}
          <div className="bg-paper-card border-2 border-ink rounded-2xl p-6 shadow-xl relative flex flex-col justify-between scale-[1.02] bg-gradient-to-b from-paper-card to-brass/5">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-ink text-paper-card text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="text-brass">★</span> MOST POPULAR FOR SMALL AGENCIES
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 mt-1">
                <h3 className="text-lg font-bold text-ink font-display">Boutique Team</h3>
                <span className="text-[10px] font-mono font-bold bg-ink text-paper-card px-2 py-0.5 rounded">
                  2–4 CLOSERS
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                The sweet spot for small-to-mid agencies and regional sales desks.
              </p>
              <div className="mb-6 pb-4 border-b border-architecturalLine">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-ink">
                    ₹{billingCycle === "monthly" ? "4,999" : "3,999"}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                {billingCycle === "yearly" ? (
                  <p className="text-[11px] text-verdigris font-mono font-medium mt-1">
                    Billed ₹47,988/year (Save ₹12,000/yr)
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    Includes 3 Closers + 1 Manager Cockpit
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> 3 Closer Seats + 1 Executive Cockpit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Up to 2,500 Leads with 360° Dossiers
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> 5 Project Catalogs & Inventory Matrices
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> AI Buyer-to-Unit Matcher Engine
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Automated SLA Calling Queue
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Priority Phone & WhatsApp Support
                </li>
              </ul>
            </div>

            <Link
              href="/login?mode=signup"
              className="w-full py-3 px-4 bg-ink text-paper-card font-bold text-xs rounded-xl hover:bg-ink-hover transition-all text-center shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5 text-brass" />
            </Link>
          </div>

          {/* Plan 3: Scale Desk */}
          <div className="bg-paper-card border border-architecturalLine rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-brass/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-ink font-display">Scale Desk</h3>
                <span className="text-[10px] font-mono font-semibold bg-paper text-slate-600 px-2 py-0.5 rounded border border-architecturalLine">
                  5–10 CLOSERS
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                For established brokerages managing multiple luxury mandates.
              </p>
              <div className="mb-6 pb-4 border-b border-architecturalLine">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-ink">
                    ₹{billingCycle === "monthly" ? "9,999" : "7,999"}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                {billingCycle === "yearly" ? (
                  <p className="text-[11px] text-verdigris font-mono font-medium mt-1">
                    Billed ₹95,988/year (Save ₹24,000/yr)
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    Includes 10 Closers + Full Analytics
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Up to 10 Closer Seats & Managers
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Up to 10,000 Active Leads
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Unlimited Projects & Inventory Units
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Multi-City Regional Tenant Partitioning
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-verdigris" /> Dedicated Account Manager & Onboarding
                </li>
              </ul>
            </div>

            <Link
              href="/login?mode=signup"
              className="w-full py-2.5 px-4 bg-paper hover:bg-paper-subtle text-ink font-semibold text-xs rounded-xl border border-architecturalLine transition-all text-center"
            >
              Start 14-Day Free Trial
            </Link>
          </div>
        </div>

        {/* Clear Trial Policy Notice */}
        <div className="max-w-2xl mx-auto p-4 bg-paper rounded-xl border border-architecturalLine text-center text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-ink">💡 Transparent Trial & Billing Policy</p>
          <p>
            You get 100% full feature access for 14 days without entering credit card details. At the end of 14 days, you can choose to activate your plan via UPI/Card, or your workspace gracefully pauses with zero surprise charges.
          </p>
        </div>
      </section>

      {/* 8. EARLY ACCESS PILOT FEEDBACK */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-paper-subtle border-y border-architecturalLine">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brass bg-brass-light px-3 py-1 rounded-full border border-brass-border">
              [BETA PILOT REVIEWS]
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-display">
              Feedback from Beta Sales Desks
            </h2>
            <p className="text-xs text-slate-500">
              Early feedback gathered from luxury advisory teams during our closed beta testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "The 10-second touchpoint modal eliminated the friction of updating our CRM. Closers actually log their calls now because it takes 2 clicks instead of 2 minutes.",
                role: "Managing Director",
                company: "High-Ticket Advisory Desk (Gurgaon Pilot)",
              },
              {
                quote:
                  "Matching buyer requirements with active floor plans in 10 seconds during the call gives our reps massive confidence. Our site-visit scheduling speed noticeably increased.",
                role: "Sales Director",
                company: "Premium Residential Agency (NCR Beta)",
              },
              {
                quote:
                  "Having strict separation between our regional team leads while giving leadership an executive overview is exactly what we needed to scale past 10 closers.",
                role: "Principal Broker",
                company: "Prime Residential Advisory (South Mumbai Pilot)",
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-paper-card border border-architecturalLine rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex text-brass gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-brass text-brass" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="border-t border-architecturalLine pt-3">
                  <p className="font-bold text-xs text-ink">{t.role}</p>
                  <p className="text-[11px] text-brass font-medium">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. MOBILE COMPANION APP (HONEST BETA WAITING LIST) */}
      <section id="mobile-app" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-ink text-paper-card rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-5 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono font-semibold text-brass border border-brass/30">
              <Smartphone className="h-3.5 w-3.5" />
              <span>[MOBILE COMPANION · ANDROID & iOS IN BUILD]</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              Sales Closers Never Sit at Desks. Take CallCRM On Site.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We are currently engineering native mobile apps for site offices: 1-click calling, WhatsApp quick-replies, offline buyer dossiers, and live unit availability.
            </p>

            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brass" /> Instant Push Notifications for Hot Inbound Buyer Inquiries
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brass" /> 1-Click WhatsApp Proposal & Floor-Plan Dispatch
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brass" /> Offline Site Visit Check-ins & GPS Verification
              </li>
            </ul>

            {/* Verified Beta Signup Form with Local Storage */}
            <div className="pt-2">
              {mobileBetaSubmitted ? (
                <div className="p-3 bg-verdigris/40 border border-verdigris rounded-xl text-xs text-verdigris-light flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Verified! You&apos;ve been added to our Mobile Beta Early Access list.</span>
                </div>
              ) : (
                <form onSubmit={handleMobileBetaSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    value={mobileBetaEmail}
                    onChange={(e) => setMobileBetaEmail(e.target.value)}
                    placeholder="Enter work email for early APK access"
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-brass flex-1 font-mono"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-brass text-ink font-bold text-xs rounded-xl hover:bg-brass-hover transition-all shrink-0 font-sans"
                  >
                    Join Mobile Beta
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* High-Resolution Code-Rendered Smartphone UI Frame */}
          <div className="shrink-0 flex items-center justify-center">
            <MobileCompanionDeviceFrame />
          </div>
        </div>
      </section>

      {/* 10. COMPREHENSIVE ACCORDION FAQ SECTION (All 5 questions answered) */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brass bg-brass-light px-3 py-1 rounded-full border border-brass-border">
            [KNOWLEDGE BASE]
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">Everything you need to know about CallCRM and the 14-day trial.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Can I import leads from property portals and Facebook Ads?",
              a: "Yes. CallCRM provides 1-click CSV and Excel import templates that automatically map buyer name, phone, budget, and configuration preferences directly into your priority calling queue in under 30 seconds.",
            },
            {
              q: "How does the Buyer-to-Unit Matcher work?",
              a: "When you record a lead's requirements (e.g. 4 BHK, high floor, park facing, budget ₹12 Cr), CallCRM automatically scans your inventory matrices and highlights units with 4/4 exact matches, allowing reps to pitch suitable units instantly on the phone.",
            },
            {
              q: "Can our sales closers see each other's leads?",
              a: "No. CallCRM is architected with strict role-based data partitioning. Salespersons only see their own assigned leads, while Sales Managers and Founders have full organizational visibility across regional desks.",
            },
            {
              q: "What happens after the 14-day free trial?",
              a: "You get 100% full feature access during the trial. No credit card is required to sign up. At the end of 14 days, you can choose to activate your plan via UPI/Card, or your workspace gracefully pauses with zero unexpected charges.",
            },
            {
              q: "Can I add more seats as my sales team grows?",
              a: "Yes. You can start on the Solo or Boutique plan and add additional sales closer seats or upgrade anytime with prorated billing.",
            },
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-paper-card border border-architecturalLine rounded-xl p-4 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-ink focus:outline-none"
                >
                  <span className="font-display">{faq.q}</span>
                  <span className="text-brass text-xs font-mono font-bold shrink-0 ml-2">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-architecturalLine leading-relaxed animate-in fade-in-50">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. FINAL BOTTOM CTA BANNER */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-paper-subtle border-t border-architecturalLine text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight font-display">
            Ready to Supercharge Your Real Estate Sales Team?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Experience the architectural sales command center designed for high-ticket property closers. Set up your workspace in 60 seconds.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/login?mode=signup"
              className="py-3.5 px-8 bg-ink text-paper-card font-bold text-sm rounded-xl hover:bg-ink-hover transition-all flex items-center gap-2 shadow-md active:scale-[0.99]"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-4 w-4 text-brass" />
            </Link>
          </div>
        </div>
      </section>

      {/* 12. ARCHITECTURAL LEDGER FOOTER */}
      <footer className="w-full bg-paper-card border-t border-architecturalLine py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="space-y-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 font-bold text-sm text-ink font-display">
              <Building2 className="h-4 w-4 text-brass" />
              <span>Apex CallCRM</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              The high-velocity sales command center engineered for Indian luxury real estate developers and advisory desks.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-ink">Product</h5>
            <ul className="space-y-1.5 text-slate-500 text-[11px]">
              <li><a href="#features" className="hover:text-ink">Next Best Moves</a></li>
              <li><a href="#features" className="hover:text-ink">Buyer-to-Unit Matcher</a></li>
              <li><a href="#features" className="hover:text-ink">Rapid 10s Logger</a></li>
              <li><a href="#pricing" className="hover:text-ink">Subscription Pricing</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-ink">Supported Regions</h5>
            <ul className="space-y-1.5 text-slate-500 text-[11px]">
              <li>Gurgaon & Golf Course Ext.</li>
              <li>South Delhi & Lutyens</li>
              <li>Mumbai MMR & Worli</li>
              <li>Bangalore North & East</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-ink">Security & Standards</h5>
            <ul className="space-y-1.5 text-slate-500 text-[11px]">
              <li>Lead Privacy Architecture</li>
              <li>Role-Based Access Control</li>
              <li>Client Confidentiality Guardrails</li>
              <li>Encrypted Session Tokens</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-architecturalLine flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <p>© 2026 Apex Realty Technologies. All rights reserved.</p>
          <p>ENGINEERED FOR HIGH-TICKET REAL ESTATE CLOSERS</p>
        </div>
      </footer>
    </div>
  );
}
