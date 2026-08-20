"use client";

import * as React from "react";
import { Contact, Search, Phone, MessageSquare, Plus, Building2 } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatPhone } from "@/lib/utils";

export default function PeoplePage() {
  const { leads } = useCRM();
  const [search, setSearch] = React.useState("");

  const people = leads.filter((l) =>
    l.personName.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Contact className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              People & Contacts Identity
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deduplicated contact records with phone normalization and property interest history.
          </p>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-border bg-card shadow-subtle flex items-center justify-between gap-3 text-xs">
        <div className="relative w-64 sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contact by name or phone..."
            className="pl-8 h-8 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">{people.length} Contacts</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Associated Projects</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-semibold text-foreground">{p.personName}</TableCell>
              <TableCell className="font-mono text-xs">{formatPhone(p.phone)}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{p.email || "—"}</TableCell>
              <TableCell className="text-xs font-medium text-foreground">{p.projectName}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{p.regionName}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <a
                    href={`tel:${p.phone}`}
                    className="inline-flex items-center justify-center h-7 px-2 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${p.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-7 px-2 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </a>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
