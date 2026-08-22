"use client";

import * as React from "react";
import {
  Contact,
  Search,
  Phone,
  MessageSquare,
  Plus,
  Building2,
  Calendar,
  Clock,
  User,
  History,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PipelineBadge, TaskStatusBadge } from "@/components/ui/status-badge";
import { formatCurrencyINR, formatPhone } from "@/lib/utils";
import { Person, Lead } from "@/types/crm";

export function PeoplePage() {
  const { people, leads, activities } = useCRM();
  const [search, setSearch] = React.useState("");
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      ((p.regionName || p.city) && (p.regionName || p.city)!.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenPerson = (person: Person) => {
    setSelectedPerson(person);
    setProfileOpen(true);
  };

  // Enquiries and activities for selected person
  const personLeads = selectedPerson
    ? leads.filter((l) => l.personId === selectedPerson.id || l.phone === selectedPerson.phone)
    : [];

  const personActivities = selectedPerson
    ? activities.filter((a) => personLeads.some((l) => l.id === a.leadId))
    : [];

  const totalInquiredBudget = personLeads.reduce((acc, l) => acc + (l.budget || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Contact className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              People Directory & 360° Contact Dossier
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deduplicated master contact directory with multi-project inquiry tracking and communication history.
          </p>
        </div>

        <span className="text-xs font-mono text-muted-foreground">
          {people.length} Verified Master Contacts
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex items-center justify-between gap-3 text-xs">
        <div className="relative w-64 sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts by name, phone, city..."
            className="pl-8 h-8 text-xs bg-secondary/40"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Showing {filteredPeople.length} contacts
        </span>
      </div>

      {/* Contacts Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact Profile</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>City / Region</TableHead>
            <TableHead>Project Enquiries</TableHead>
            <TableHead>Total Inquired Value</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPeople.map((p) => {
            const pLeads = leads.filter((l) => l.personId === p.id || l.phone === p.phone);
            const pVal = pLeads.reduce((acc, l) => acc + (l.budget || 0), 0);

            return (
              <TableRow
                key={p.id}
                onClick={() => handleOpenPerson(p)}
                className="cursor-pointer hover:bg-secondary/40 transition-colors"
              >
                <TableCell>
                  <div className="font-bold text-foreground text-sm">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    Client since {new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-foreground">
                  {formatPhone(p.phone)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{p.email || "—"}</TableCell>
                <TableCell className="text-xs font-medium text-foreground">{p.regionName || p.city || "NCR Hub"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.associatedProjectNames?.map((projName, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-medium text-foreground"
                      >
                        {projName}
                      </span>
                    )) || <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell className="font-mono font-bold text-foreground text-xs">
                  {formatCurrencyINR(pVal)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <a
                      href={`tel:${p.phone}`}
                      className="inline-flex items-center justify-center h-7 px-2 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${p.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center h-7 px-2 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <MessageSquare className="h-3 w-3" />
                    </a>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* 360° Contact Profile Modal */}
      {selectedPerson && (
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <DialogHeader className="pb-3 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <DialogTitle className="text-xl font-bold text-foreground">
                    {selectedPerson.name}
                  </DialogTitle>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {formatPhone(selectedPerson.phone)} {selectedPerson.email && `• ${selectedPerson.email}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedPerson.phone}`}
                    className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    Call Contact
                  </a>
                  <a
                    href={`https://wa.me/${selectedPerson.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </DialogHeader>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl border border-border bg-card text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Inquiries</span>
                <span className="text-base font-bold text-foreground font-mono">{personLeads.length} Deals</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Lifetime Budget</span>
                <span className="text-base font-bold text-foreground font-mono">{formatCurrencyINR(totalInquiredBudget)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Primary Location</span>
                <span className="text-sm font-semibold text-foreground">{selectedPerson.regionName || selectedPerson.city || "NCR Hub"}</span>
              </div>
            </div>

            {/* Associated Leads / Deals across Projects */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Associated Property Enquiries ({personLeads.length})
              </h4>
              <div className="space-y-2">
                {personLeads.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span>{l.projectName}</span>
                        {l.assignedUnitNumber && (
                          <span className="text-[10px] font-mono bg-card px-1.5 py-0.5 rounded border border-border font-bold">
                            Unit {l.assignedUnitNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Rep: <strong>{l.salespersonName}</strong> • Budget: <span className="font-mono font-semibold">{formatCurrencyINR(l.budget)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PipelineBadge stage={l.stage} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication History Timeline */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Lifetime Touchpoints & Notes ({personActivities.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {personActivities.length === 0 ? (
                  <div className="p-3 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    No logged interactions for this contact.
                  </div>
                ) : (
                  personActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-lg border border-border bg-card text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold capitalize text-foreground">{act.type} Touchpoint</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {act.notes && (
                        <p className="text-muted-foreground text-[11px]">&ldquo;{act.notes}&rdquo;</p>
                      )}
                      <div className="text-[10px] text-muted-foreground/80 flex items-center justify-between">
                        <span>Logged by {act.userName}</span>
                        {act.scheduledFollowUpAt && (
                          <span className="text-amber-800 font-semibold font-mono">
                            Next: {act.scheduledFollowUpAt}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
