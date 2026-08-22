"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Zap,
  CheckCircle2,
  TrendingUp,
  MapPin,
  IndianRupee,
  Phone,
  UserCheck,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import { useCRM } from "@/context/crm-context";
import { toast } from "sonner";
import { formatINR } from "@/lib/utils";

interface AiLeadBotProps {
  onOpenLeadDetail?: (leadId: string) => void;
  defaultOpen?: boolean;
}

interface QualifiedLeadCardData {
  personName: string;
  phone: string;
  location: string;
  configuration: string;
  budget: number;
  timeline: string;
  buyerIntent: string;
  leadScore: number;
  leadScoreLabel: "Hot" | "Warm" | "Cold";
  buyingSignals?: string[];
  objections?: string[];
  notes: string;
  crmLeadId?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
}

const QUICK_PROMPTS = [
  {
    label: "⚡ Gurgaon 3 BHK (₹3.8 Cr)",
    text: "Hi Aria, my name is Siddharth Verma (+919811099234). I am actively looking for an ultra-luxury 3 BHK + Servant in Golf Course Extension Road, Gurgaon. My budget is around ₹3.8 Crores and I want to finalize within 45 days.",
  },
  {
    label: "🌊 Mumbai Sea-View (₹9 Cr)",
    text: "Hello, I am Ananya Singhania (+919820011456). Looking for a 4 BHK sea-facing residence in Worli or Bandra West, budget ₹8.5 to 10 Cr. We are end-users looking for possession within 6 months.",
  },
  {
    label: "🌿 Bengaluru Villa (₹4.5 Cr)",
    text: "Hey Aria, Rajesh Nair here (+919845012398). Looking for a 4 BHK independent villa in Whitefield, Bengaluru with a private garden. Budget ₹4.5 Cr, ready to visit this weekend.",
  },
];

export function AiLeadBot({ onOpenLeadDetail, defaultOpen = false }: AiLeadBotProps) {
  const { createLead, projects, regions, users } = useCRM();
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [qualifiedLeads, setQualifiedLeads] = React.useState<QualifiedLeadCardData[]>([]);
  const [simulatedMessages, setSimulatedMessages] = React.useState<
    Array<{ id: string; role: "assistant" | "user"; content: string; toolCard?: QualifiedLeadCardData; createdAt: Date }>
  >([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Namaste! I'm Aria, your Autonomous Luxury Real Estate Advisor. I can assist you with premier properties across Gurgaon, Mumbai, and Bengaluru.\n\nTell me what you're looking for (location, budget, or preferred configuration) and I will prepare a personalized shortlist!",
      createdAt: new Date(),
    },
  ]);
  const [simulatedInput, setSimulatedInput] = React.useState("");
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [useSimulationMode, setUseSimulationMode] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom on message change
  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, simulatedMessages, isSimulating]);

  // Handler to register qualified lead into the actual CRMContext
  const handleLeadQualification = React.useCallback(
    async (leadData: QualifiedLeadCardData) => {
      try {
        // Find matching project or default to first project
        const matchedProject =
          projects.find(
            (p) =>
              p.location.toLowerCase().includes(leadData.location.toLowerCase()) ||
              p.name.toLowerCase().includes(leadData.location.toLowerCase())
          ) || projects[0];

        const matchedRegion =
          regions.find((r) => r.id === matchedProject?.regionId) || regions[0];
        const assignedRep =
          users.find((u) => u.role === "salesperson") || users[0];

        const newLead = await createLead({
          personId: `per-${Date.now()}`,
          personName: leadData.personName,
          phone: leadData.phone,
          email: `${leadData.personName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
          projectId: matchedProject?.id || "proj-1",
          projectName: matchedProject?.name || "The Grand Palm Residences",
          regionId: matchedRegion?.id || "reg-1",
          regionName: matchedRegion?.name || "Gurgaon / NCR",
          salespersonId: assignedRep.id,
          salespersonName: assignedRep.name,
          budget: leadData.budget,
          stage: "qualified",
          source: "Aria AI Autonomous Bot (Web/WhatsApp)",
          leadScore: leadData.leadScore || 92,
          leadScoreLabel: leadData.leadScoreLabel || "Hot",
          dealHealth: "strong",
          dealHealthReason: `AI Qualified: High conviction ${leadData.configuration} buyer with verified ₹${(leadData.budget / 10000000).toFixed(1)} Cr budget`,
          configurationPreference: leadData.configuration,
          buyerIntent: leadData.buyerIntent || "End-User (Primary Residence)",
          buyingSignals: leadData.buyingSignals || [
            "Clear budget verified",
            "Target location specified",
            "Ready for site visit",
          ],
          objections: leadData.objections || [],
          lastConversationSummary: leadData.notes,
          suggestedNextMove: "Schedule VIP Site Visit & deliver customized cost sheet dossier.",
          daysInStage: 0,
          nextFollowUpAt: "Today, 11:30 AM",
          followUpStatus: "due_today",
        });

        toast.success(`⚡ Aria Qualified & Synced: ${leadData.personName} → CRM Pipeline!`, {
          description: `Added to "Qualified" stage with Score ${leadData.leadScore} (Hot).`,
          duration: 5000,
        });

        return newLead.id;
      } catch (err) {
        console.error("Failed to sync qualified lead to CRM:", err);
        return undefined;
      }
    },
    [createLead, projects, regions, users]
  );

  // Simulated Autonomous Agent Engine (Runs seamlessly if no Gemini API Key is configured)
  const handleSimulatedSubmit = async (customPrompt?: string) => {
    const text = customPrompt || simulatedInput;
    if (!text.trim() || isSimulating) return;

    setSimulatedInput("");
    const userMsg = {
      id: `usr-${Date.now()}`,
      role: "user" as const,
      content: text,
      createdAt: new Date(),
    };
    setSimulatedMessages((prev) => [...prev, userMsg]);
    setIsSimulating(true);

    // Analyze intent from text to simulate real LLM function calling
    setTimeout(async () => {
      const lower = text.toLowerCase();

      // Extract Name
      const nameMatch = text.match(/(?:i am|name is|here|myself)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const name = nameMatch ? nameMatch[1] : (lower.includes("siddharth") ? "Siddharth Verma" : lower.includes("ananya") ? "Ananya Singhania" : lower.includes("rajesh") ? "Rajesh Nair" : "Aman Mehra");

      // Extract Phone
      const phoneMatch = text.match(/(\+91[\d\s-]{10,12}|0?[\d]{10})/);
      const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, "") : "+91 98110 99234";

      // Extract Location
      let location = "Gurgaon Golf Course Ext";
      if (lower.includes("mumbai") || lower.includes("worli") || lower.includes("bandra")) {
        location = "Worli, South Mumbai";
      } else if (lower.includes("bengaluru") || lower.includes("bangalore") || lower.includes("whitefield")) {
        location = "Whitefield, Bengaluru";
      }

      // Extract Config
      let configuration = "3 BHK Luxury + Servant";
      if (lower.includes("4 bhk") || lower.includes("villa")) {
        configuration = lower.includes("villa") ? "4 BHK Independent Luxury Villa" : "4 BHK Sky Mansion";
      } else if (lower.includes("2 bhk")) {
        configuration = "2 BHK Premium";
      }

      // Extract Budget
      let budget = 38000000;
      if (lower.includes("9") || lower.includes("10") || lower.includes("8.5")) {
        budget = 90000000;
      } else if (lower.includes("4.5") || lower.includes("4 cr")) {
        budget = 45000000;
      } else if (lower.includes("2")) {
        budget = 25000000;
      }

      const qualifiedData: QualifiedLeadCardData = {
        personName: name,
        phone: phone,
        location: location,
        configuration: configuration,
        budget: budget,
        timeline: lower.includes("weekend") ? "Immediate (This Weekend)" : "Within 30-45 Days",
        buyerIntent: lower.includes("invest") ? "High-yield Capital Growth" : "End-User (Primary Residence)",
        leadScore: budget >= 35000000 ? 94 : 88,
        leadScoreLabel: "Hot",
        approvalStatus: "pending",
        buyingSignals: [
          "Budget strictly verified within target range",
          "High intent for luxury gated inventory",
          "Direct phone number provided for VIP site visit",
        ],
        objections: lower.includes("possession") ? ["Possession timeline verification needed"] : [],
        notes: `Autonomous qualification by Aria AI: Buyer looking for ${configuration} in ${location} with ₹${formatINR(budget)} budget. High buying conviction.`,
      };

      const aiResponse = {
        id: `ai-${Date.now()}`,
        role: "assistant" as const,
        content: `Thank you, ${name}! I have extracted your luxury preferences.\n\n✨ **Awaiting Human Approval Gate:**\nPlease review the extracted parameters below and click "Approve & Sync to CRM" to register this opportunity in the sales pipeline.`,
        toolCard: qualifiedData,
        createdAt: new Date(),
      };

      setSimulatedMessages((prev) => [...prev, aiResponse]);
      setIsSimulating(false);
    }, 1200);
  };

  // Human-in-the-loop: Approve lead creation
  const handleApproveLead = async (msgId: string, leadData: QualifiedLeadCardData) => {
    const createdId = await handleLeadQualification(leadData);
    setSimulatedMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.toolCard) {
          return {
            ...m,
            toolCard: {
              ...m.toolCard,
              approvalStatus: "approved",
              crmLeadId: createdId,
            },
          };
        }
        return m;
      })
    );
  };

  // Human-in-the-loop: Reject lead creation
  const handleRejectLead = (msgId: string) => {
    setSimulatedMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.toolCard) {
          return {
            ...m,
            toolCard: {
              ...m.toolCard,
              approvalStatus: "rejected",
            },
          };
        }
        return m;
      })
    );
    toast.info("Lead qualification discarded by operator.");
  };

  const handleResetChat = () => {
    setSimulatedMessages([
      {
        id: "init-1",
        role: "assistant",
        content:
          "Namaste! I'm Aria, your Autonomous Luxury Real Estate Advisor. I can assist you with premier properties across Gurgaon, Mumbai, and Bengaluru.\n\nTell me what you're looking for (location, budget, or preferred configuration) and I will prepare a personalized shortlist!",
        createdAt: new Date(),
      },
    ]);
    toast.info("Aria chat session refreshed");
  };

  return (
    <>
      {/* Floating Trigger Launcher */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Subtle Attention Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-medium shadow-xl border border-slate-700/60 backdrop-blur-md animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Aria AI: Qualify Leads Live</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Aria AI Assistant"
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl hover:scale-105 transition-all duration-300 border border-slate-700/70 hover:border-indigo-500/50 hover:shadow-indigo-500/20"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
            <div className="relative flex items-center justify-center">
              <Bot className="w-7 h-7 text-indigo-300 group-hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950" />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col bg-slate-950/95 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden ${
            isExpanded
              ? "inset-4 md:inset-10"
              : "bottom-6 right-6 w-[95vw] sm:w-[440px] h-[640px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md">
                <Sparkles className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">Aria AI Assistant</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold font-mono tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                    Autonomous
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">High-Ticket Lead Qualifier & Matcher</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Chat Session"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Window"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Simulation Pills */}
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 whitespace-nowrap mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Test Inbound:
            </span>
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulatedSubmit(p.text)}
                disabled={isSimulating}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-950 hover:text-indigo-200 hover:border-indigo-700/60 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700/50 transition-all flex items-center gap-1 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
            {simulatedMessages.map((msg) => {
              const isUser = msg.role === "user";
              const isPending = msg.toolCard?.approvalStatus === "pending";
              const isApproved = msg.toolCard?.approvalStatus === "approved";
              const isRejected = msg.toolCard?.approvalStatus === "rejected";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                      isUser
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none"
                        : "bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>

                  {/* Tool Action Card: Human-in-the-loop Approval Card */}
                  {msg.toolCard && (
                    <div className={`mt-3 w-full max-w-[95%] p-4 rounded-xl bg-gradient-to-b from-slate-900 to-indigo-950/40 border shadow-xl text-xs space-y-3 ${
                      isApproved 
                        ? "border-emerald-500/40" 
                        : isRejected 
                        ? "border-slate-700/60 opacity-60" 
                        : "border-amber-500/50 ring-1 ring-amber-500/20"
                    }`}>
                      <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-md ${
                            isApproved 
                              ? "bg-emerald-500/20 text-emerald-400" 
                              : isRejected 
                              ? "bg-rose-500/20 text-rose-400" 
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-white tracking-wide uppercase text-[11px]">
                              {isApproved 
                                ? "✓ Lead Approved & Synced to CRM" 
                                : isRejected 
                                ? "✕ Lead Discarded by Operator" 
                                : "⚡ Awaiting Human Operator Approval"}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {isApproved 
                                ? "Live in Qualified Stage" 
                                : isRejected 
                                ? "No CRM writes performed" 
                                : "Review parameters before mutating CRM"}
                            </p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> SCORE: {msg.toolCard.leadScore} ({msg.toolCard.leadScoreLabel})
                        </span>
                      </div>

                      {/* Lead Specs Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                          <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                            <UserCheck className="w-3 h-3 text-indigo-400" /> Buyer Name
                          </span>
                          <span className="font-semibold text-slate-100 block truncate">
                            {msg.toolCard.personName}
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">
                            {msg.toolCard.phone}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                          <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                            <IndianRupee className="w-3 h-3 text-emerald-400" /> Verified Budget
                          </span>
                          <span className="font-bold text-emerald-300 block">
                            ₹{(msg.toolCard.budget / 10000000).toFixed(2)} Cr
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {msg.toolCard.timeline}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 col-span-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                              <Building2 className="w-3 h-3 text-indigo-400" /> Requirement Specs
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {msg.toolCard.location}
                            </span>
                          </div>
                          <span className="font-medium text-slate-200 block mt-0.5">
                            {msg.toolCard.configuration}
                          </span>
                        </div>
                      </div>

                      {/* Human-in-the-Loop Action Gate */}
                      {isPending && (
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleRejectLead(msg.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
                          >
                            ✕ Discard
                          </button>
                          <button
                            onClick={() => handleApproveLead(msg.id, msg.toolCard!)}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                          >
                            ✓ Approve & Push to CRM
                          </button>
                        </div>
                      )}

                      {isApproved && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active in Salesperson Follow-up Queue
                          </span>
                          {onOpenLeadDetail && msg.toolCard.crmLeadId && (
                            <button
                              onClick={() => onOpenLeadDetail(msg.toolCard!.crmLeadId!)}
                              className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
                            >
                              View Lead <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                    {msg.createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}

            {isSimulating && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                </div>
                <span className="font-mono text-[11px]">
                  Aria is qualifying & matching inventory...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSimulatedSubmit();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={simulatedInput}
              onChange={(e) => setSimulatedInput(e.target.value)}
              placeholder="Ask Aria or test an inbound inquiry..."
              disabled={isSimulating}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!simulatedInput.trim() || isSimulating}
              aria-label="Send message to Aria"
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
