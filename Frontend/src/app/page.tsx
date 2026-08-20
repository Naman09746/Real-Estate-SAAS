"use client";

import * as React from "react";
import {
  Building2,
  Phone,
  MessageSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PipelineBadge, TaskStatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";

// Sample Real Estate Leads for CallCRM Demonstration
const MOCK_LEADS = [
  {
    id: "lead-1",
    name: "Rajesh Singhal",
    phone: "9811234567",
    project: "DLF The Arbour, Sec 63",
    region: "Gurgaon",
    budget: 65000000,
    salesperson: "Rahul Sharma",
    stage: "site_visit",
    lastActivity: "Call logged: Site visit scheduled for Sunday 11 AM",
    nextFollowUp: "Today, 11:00 AM",
    followUpStatus: "due_today",
  },
  {
    id: "lead-2",
    name: "Ananya Deshmukh",
    phone: "9876543210",
    project: "Godrej Woods, Sec 43",
    region: "Noida",
    budget: 28500000,
    salesperson: "Pooja Verma",
    stage: "negotiation",
    lastActivity: "WhatsApp: Shared unit layout and payment plan",
    nextFollowUp: "Tomorrow, 2:30 PM",
    followUpStatus: "upcoming",
  },
  {
    id: "lead-3",
    name: "Vikram Mehra",
    phone: "9988776655",
    project: "M3M Crown, Sec 111",
    region: "Gurgaon",
    budget: 34000000,
    salesperson: "Rahul Sharma",
    stage: "qualified",
    lastActivity: "Call: Budget confirmed, looking for 3 BHK + Servant",
    nextFollowUp: "Yesterday",
    followUpStatus: "overdue",
  },
  {
    id: "lead-4",
    name: "Suresh Gupta",
    phone: "9810098100",
    project: "Max Estates 128",
    region: "Noida",
    budget: 52000000,
    salesperson: "Amit Saxena",
    stage: "won",
    lastActivity: "Booking amount received, agreement in progress",
    nextFollowUp: "Completed",
    followUpStatus: "completed",
  },
];

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = React.useState("showcase");
  const [logOutcome, setLogOutcome] = React.useState("interested");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/10">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm px-4 sm:px-6 h-14 flex items-center justify-between shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm tracking-tight shadow-subtle">
              C
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-foreground">
                CallCRM
              </span>
              <span className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-secondary">
                Design System v1.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-border text-xs text-muted-foreground">
            <span className="font-medium text-foreground">DLF Real Estate Partners</span>
            <span>•</span>
            <span>Gurgaon Region</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/80 border border-border rounded-md px-2.5 py-1">
            <User className="h-3.5 w-3.5 text-foreground" />
            <span className="font-medium text-foreground">Rahul Sharma</span>
            <span className="text-muted-foreground text-[11px]">(Salesperson)</span>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 shadow-subtle">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Log Quick Activity</span>
                <span className="sm:hidden">Log</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle>Quick Activity Log</DialogTitle>
                <DialogDescription>
                  10-second activity logger optimized for mobile and fast call disposition.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveActivity} className="space-y-3.5 py-2">
                <div className="space-y-1">
                  <Label>Contact</Label>
                  <div className="p-2.5 rounded-lg border border-border bg-secondary/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-foreground">Rajesh Singhal</div>
                      <div className="text-muted-foreground">+91 98112 34567 • DLF The Arbour</div>
                    </div>
                    <Badge variant="outline">Lead #1042</Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label required>Call Outcome</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "interested", label: "Interested" },
                      { id: "site_visit", label: "Site Visit Booked" },
                      { id: "call_back", label: "Call Back Later" },
                      { id: "not_interested", label: "Not Interested" },
                    ].map((outcome) => (
                      <button
                        key={outcome.id}
                        type="button"
                        onClick={() => setLogOutcome(outcome.id)}
                        className={`h-9 px-3 text-xs font-medium rounded-md border transition-all text-left flex items-center justify-between ${
                          logOutcome === outcome.id
                            ? "border-primary bg-primary text-primary-foreground font-semibold shadow-subtle"
                            : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span>{outcome.label}</span>
                        {logOutcome === outcome.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="quick-note">Notes (Optional)</Label>
                  <Textarea
                    id="quick-note"
                    placeholder="Client asked about floor 18+ and payment plan..."
                    rows={2}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="next-fup">Next Follow-up</Label>
                  <Input id="next-fup" type="datetime-local" defaultValue="2026-08-22T11:00" />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
                    Save Activity
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Page Title & Philosophy Alert */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              CallCRM Design System & Quality Gate
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Strict off-white light theme, 4px/8px layout grid, WCAG 2.2 AA accessibility, and zero AI gimmicks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
              ● Visual Quality Gate Passed
            </Badge>
          </div>
        </div>

        {/* Global Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:inline-flex">
            <TabsTrigger value="overview">Live CRM Elements</TabsTrigger>
            <TabsTrigger value="components">UI Tokens & Primitives</TabsTrigger>
            <TabsTrigger value="density">Data Table & Density</TabsTrigger>
          </TabsList>

          {/* TAB 1: Real-World CRM View (Boss + Salesperson Workflows) */}
          <TabsContent value="overview" className="space-y-6 pt-4">
            {/* KPI Cards Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Open Leads</CardDescription>
                  <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">248</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="font-semibold text-emerald-600 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +12%
                  </span>
                  <span>vs last month</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Site Visits Done</CardDescription>
                  <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">34</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="font-medium text-foreground">8 scheduled</span>
                  <span>for this weekend</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Deals Closed (Won)</CardDescription>
                  <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">18</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">₹24.6 Cr</span>
                  <span>total booking value</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Follow-ups Due Today</CardDescription>
                  <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-700">14</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="font-semibold text-rose-600">3 overdue</span>
                  <span>requiring urgent call</span>
                </CardContent>
              </Card>
            </div>

            {/* Salesperson Daily Workflow + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Follow-up Queue */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Today's Priority Follow-ups</h2>
                    <p className="text-xs text-muted-foreground">Mobile-first task execution for salespeople</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View All (14)
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {MOCK_LEADS.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-subtle hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{lead.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{formatPhone(lead.phone)}</span>
                          <PipelineBadge stage={lead.stage} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 text-foreground/80">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {lead.project}
                          </span>
                          <span>•</span>
                          <span>Budget: <strong className="text-foreground font-medium">{formatCurrencyINR(lead.budget)}</strong></span>
                          <span>•</span>
                          <TaskStatusBadge status={lead.followUpStatus} />
                        </div>
                      </div>

                      {/* Fast Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <IconButton
                          icon={<Phone className="h-4 w-4 text-emerald-700" />}
                          aria-label={`Call ${lead.name}`}
                          className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                        />
                        <IconButton
                          icon={<MessageSquare className="h-4 w-4 text-emerald-700" />}
                          aria-label={`WhatsApp ${lead.name}`}
                          className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                        />
                        <Button size="sm" variant="secondary" className="text-xs h-9">
                          Log Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
                  <span className="text-xs text-muted-foreground">Live Log</span>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    {[
                      {
                        type: "Call",
                        user: "Rahul S.",
                        lead: "Rajesh Singhal",
                        time: "10:42 AM",
                        detail: "Scheduled site visit for Sunday morning 11 AM.",
                      },
                      {
                        type: "WhatsApp",
                        user: "Pooja V.",
                        lead: "Ananya Deshmukh",
                        time: "09:15 AM",
                        detail: "Sent brochure for 3BHK tower B.",
                      },
                      {
                        type: "Site Visit",
                        user: "Amit S.",
                        lead: "Suresh Gupta",
                        time: "Yesterday",
                        detail: "Completed walkthrough of sample flat.",
                      },
                    ].map((act, i) => (
                      <div key={i} className="flex gap-3 text-xs pb-3 border-b border-border/50 last:border-0 last:pb-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground font-semibold border border-border">
                          {act.type[0]}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{act.lead}</span>
                            <span className="text-[11px] text-muted-foreground">{act.time}</span>
                          </div>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">{act.detail}</p>
                          <div className="text-[10px] text-foreground/70 font-medium">Logged by {act.user}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Design Tokens & UI Primitives */}
          <TabsContent value="components" className="space-y-8 pt-4">
            {/* Color Palette Tokens */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">1. Restrained Color Tokens</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {[
                  { name: "Background", val: "#f8fafc", label: "Off-White Neutral", border: true },
                  { name: "Card Surface", val: "#ffffff", label: "Pure White", border: true },
                  { name: "Primary", val: "#0f172a", label: "Authoritative Slate" },
                  { name: "Secondary", val: "#f1f5f9", label: "Subtle Gray", border: true },
                  { name: "Success", val: "#059669", label: "Emerald 600" },
                  { name: "Warning", val: "#d97706", label: "Amber 600" },
                  { name: "Danger", val: "#dc2626", label: "Rose 600" },
                ].map((c) => (
                  <div key={c.name} className="p-2.5 rounded-lg border border-border bg-card space-y-1.5">
                    <div
                      className={`h-10 rounded-md ${c.border ? "border border-border" : ""}`}
                      style={{ backgroundColor: c.val }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-foreground">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{c.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons & States */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">2. Button Variants & States</h2>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary Action</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button isLoading loadingText="Saving...">
                  Submit
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            {/* Inputs & Form Elements */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">3. Form Controls</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="in-1" required>Client Name</Label>
                  <Input id="in-1" placeholder="e.g. Ramesh Chandra" defaultValue="Vikramaditya Rao" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="in-2">Phone Number</Label>
                  <Input id="in-2" placeholder="+91 XXXXX XXXXX" defaultValue="+91 98112 00000" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="in-3" required>Error Validation State</Label>
                  <Input id="in-3" error defaultValue="Invalid Indian phone number" />
                  <p className="text-[11px] text-destructive font-medium">Please enter a valid 10-digit number</p>
                </div>
              </div>
            </div>

            {/* Badges & Pipeline Status */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">4. Pipeline Stages & Task Urgency Badges</h2>
              <div className="flex flex-wrap items-center gap-2">
                <PipelineBadge stage="new" />
                <PipelineBadge stage="contacted" />
                <PipelineBadge stage="qualified" />
                <PipelineBadge stage="site_visit" />
                <PipelineBadge stage="negotiation" />
                <PipelineBadge stage="won" />
                <PipelineBadge stage="lost" />
                <span className="mx-2 text-border">|</span>
                <TaskStatusBadge status="due_today" />
                <TaskStatusBadge status="upcoming" />
                <TaskStatusBadge status="overdue" />
                <TaskStatusBadge status="completed" />
              </div>
            </div>

            {/* Skeleton & Empty States */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">5. Skeletons, Empty & Error States</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Skeleton Loading</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>

                <EmptyState
                  icon={Building2}
                  title="No projects assigned"
                  description="Assign this salesperson to a residential project to start logging leads."
                  actionLabel="Assign Project"
                  onAction={() => alert("Action triggered")}
                />

                <ErrorState
                  title="Failed to sync leads"
                  description="Check your network connection and retry the sync."
                  onRetry={() => alert("Retrying...")}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Data Density Table */}
          <TabsContent value="density" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">High-Density Lead Table</h2>
                <p className="text-xs text-muted-foreground">Scannable, compact records with Indian currency & region metadata</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search lead or phone..." className="pl-8 h-8 text-xs" />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  Filters
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact / Person</TableHead>
                  <TableHead>Project & Location</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Pipeline Stage</TableHead>
                  <TableHead>Assigned Salesperson</TableHead>
                  <TableHead>Next Follow-up</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LEADS.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{lead.name}</div>
                      <div className="text-muted-foreground text-[11px] font-mono">{formatPhone(lead.phone)}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{lead.project}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {lead.region}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {formatCurrencyINR(lead.budget)}
                    </TableCell>
                    <TableCell>
                      <PipelineBadge stage={lead.stage} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5 text-[10px]">
                          <AvatarFallback>{lead.salesperson.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{lead.salesperson}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-xs">{lead.nextFollowUp}</div>
                        <TaskStatusBadge status={lead.followUpStatus} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={<Phone className="h-3.5 w-3.5 text-foreground" />}
                          aria-label={`Call ${lead.name}`}
                          size="sm"
                        />
                        <IconButton
                          icon={<MessageSquare className="h-3.5 w-3.5 text-foreground" />}
                          aria-label={`WhatsApp ${lead.name}`}
                          size="sm"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4 px-6 text-center text-xs text-muted-foreground mt-auto">
        <p>CallCRM Phase 1 Design System • Built with Next.js, Tailwind CSS, Radix UI & Lucide Icons</p>
      </footer>
    </div>
  );
}
