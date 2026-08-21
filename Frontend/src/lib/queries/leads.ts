import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { Lead, PipelineStage } from "@/types/crm";
import { INITIAL_LEADS } from "@/lib/mock-data";
import { toast } from "sonner";

export function useLeadsQuery(orgId: string, salespersonId?: string) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  // Supabase Realtime Invalidation
  React.useEffect(() => {
    if (!supabase || !isSupabaseConfigured || !orgId) return;

    const channel = supabase
      .channel(`leads-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
          filter: `org_id=eq.${orgId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["leads", orgId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, orgId, queryClient]);

  return useQuery({
    queryKey: ["leads", orgId, salespersonId],
    queryFn: async (): Promise<Lead[]> => {
      if (supabase && isSupabaseConfigured) {
        let query = supabase.from("leads").select("*").eq("org_id", orgId);
        if (salespersonId) {
          query = query.eq("salesperson_id", salespersonId);
        }
        const { data, error } = await query;
        if (error) {
          toast.error("Failed to load live leads from database");
          throw error;
        }
        return (data as Lead[]) || [];
      }

      // Fallback to reactive local state
      return INITIAL_LEADS;
    },
  });
}

export function useUpdateLeadStageMutation(orgId: string) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({ leadId, newStage }: { leadId: string; newStage: PipelineStage }) => {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("leads")
          .update({
            stage: newStage,
            last_activity_at: new Date().toISOString(),
            last_activity_text: `Stage moved to ${newStage.toUpperCase()}`,
          })
          .eq("id", leadId)
          .eq("org_id", orgId);

        if (error) throw error;
        return data;
      }
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads", orgId] });
      toast.success(`Lead stage advanced to ${variables.newStage.toUpperCase()}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update lead stage");
    },
  });
}
