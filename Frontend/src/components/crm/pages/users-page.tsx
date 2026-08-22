"use client";

import * as React from "react";
import { Users as UsersIcon, Plus, Shield, UserCheck, MapPin, Phone, Mail } from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UsersPage() {
  const { users } = useCRM();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              User Accounts & Regional Permissions
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage organization members, role-based access control, and sales regional assignments.
          </p>
        </div>

        <Button size="sm" className="gap-1.5 shadow-subtle">
          <Plus className="h-4 w-4" />
          <span>Invite Team Member</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User / Sales Rep</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Assigned Role</TableHead>
            <TableHead>Assigned Region</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-7 w-7 text-xs">
                    <AvatarFallback className="bg-secondary text-foreground font-semibold">
                      {u.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-semibold text-foreground">{u.name}</div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{u.phone}</TableCell>
              <TableCell>
                <Badge variant={u.role === "boss" ? "default" : "secondary"} className="capitalize">
                  {u.role}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium text-foreground">
                  {u.regionName ? `${u.regionName} Hub` : "All Regions (Admin)"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                  Edit Role
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
