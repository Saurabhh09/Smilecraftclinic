import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  LogOut,
  Sparkles,
  TrendingUp,
  FileText,
  Activity,
  Plus,
  RefreshCw,
  PhoneCall,
  MessageCircle,
  Check,
  UserCheck,
  CalendarClock,
  ChevronRight,
  Shield,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/site/logo";
import { supabase } from "@/integrations/supabase/client";
import {
  getStaffDashboardData,
  updateLeadStatus,
  updateLeadIntent,
  addLeadNote,
  recordContactAttempt,
  updateAppointmentStatus,
  rescheduleAppointment,
} from "@/lib/staff.functions";
import { formatLongDate } from "@/lib/scheduling";

const staffDashboardQuery = queryOptions({
  queryKey: ["staff-dashboard-data"],
  queryFn: () => getStaffDashboardData(),
  refetchInterval: 15000,
});

export const Route = createFileRoute("/staff/dashboard")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard | SmileCraft Dental Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StaffDashboardPage,
});

function StaffDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sessionUser, setSessionUser] = useState<{ email?: string; id?: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        void navigate({ to: "/staff/login" });
      } else {
        setSessionUser(data.session.user);
      }
      setAuthChecking(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        void navigate({ to: "/staff/login" });
      } else {
        setSessionUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const { data, isLoading, refetch } = useQuery(staffDashboardQuery);

  // Filters
  const [activeTab, setActiveTab] = useState("overview");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");

  // Modals state
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; leadId: string; leadName: string }>(
    {
      open: false,
      leadId: "",
      leadName: "",
    },
  );
  const [newNoteText, setNewNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    appointmentId: string;
    patientName: string;
    currentDate: string;
    currentTime: string;
  }>({
    open: false,
    appointmentId: "",
    patientName: "",
    currentDate: "",
    currentTime: "",
  });
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [savingReschedule, setSavingReschedule] = useState(false);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    if (!data?.leads) return [];
    return data.leads.filter((lead) => {
      const matchesStatus = leadStatusFilter === "all" || lead.status === leadStatusFilter;
      const q = leadSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        `${lead.first_name} ${lead.last_name ?? ""}`.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.treatment_interest && lead.treatment_interest.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [data?.leads, leadStatusFilter, leadSearch]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    if (!data?.appointments) return [];
    return data.appointments.filter((app) => {
      const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
      const q = appSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.leadName.toLowerCase().includes(q) ||
        app.leadPhone.includes(q) ||
        app.serviceName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [data?.appointments, appStatusFilter, appSearch]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/staff/login" });
  };

  const handleStatusChange = async (
    leadId: string,
    status: "new" | "contacted" | "qualified" | "booked" | "completed" | "lost",
  ) => {
    await updateLeadStatus({ data: { leadId, status } });
    await queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
  };

  const handleIntentChange = async (
    leadId: string,
    intent: "high_intent" | "considering" | "price_shopper" | "casual_browser" | "unknown",
  ) => {
    await updateLeadIntent({ data: { leadId, intent } });
    await queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
  };

  const handleContactAttempt = async (leadId: string, method: "call" | "whatsapp" | "email") => {
    await recordContactAttempt({ data: { leadId, method } });
    await queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !noteDialog.leadId) return;
    setSavingNote(true);
    try {
      await addLeadNote({ data: { leadId: noteDialog.leadId, note: newNoteText.trim() } });
      await queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
      setNoteDialog({ open: false, leadId: "", leadName: "" });
      setNewNoteText("");
    } finally {
      setSavingNote(false);
    }
  };

  const handleUpdateAppStatus = async (
    appointmentId: string,
    status: "requested" | "confirmed" | "rescheduled" | "cancelled" | "completed" | "no_show",
  ) => {
    await updateAppointmentStatus({ data: { appointmentId, status } });
    await queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleDialog.appointmentId || !newDate || !newTime) return;
    setSavingReschedule(true);
    try {
      await rescheduleAppointment({
        data: {
          appointmentId: rescheduleDialog.appointmentId,
          appointmentDate: newDate,
          appointmentTime: newTime,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
      setRescheduleDialog({
        open: false,
        appointmentId: "",
        patientName: "",
        currentDate: "",
        currentTime: "",
      });
    } finally {
      setSavingReschedule(false);
    }
  };

  if (authChecking || isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading clinic operations portal...</p>
        </div>
      </div>
    );
  }

  const { metrics, appointments, leads, activityLogs } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/20">
              Staff Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right text-xs">
              <span className="font-semibold text-foreground">
                {sessionUser?.email ?? "receptionist@smilecraftdental.example"}
              </span>
              <span className="text-muted-foreground">Front Desk Receptionist</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container-page py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Clinic Reception & Leads</h1>
              <p className="text-sm text-muted-foreground">
                Live patient inquiries, appointment requests, diary status and activity logs.
              </p>
            </div>

            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">
                Appointments
                {metrics.todayAppointmentsCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.2 text-[10px] text-primary-foreground">
                    {metrics.todayAppointmentsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="leads">
                Leads
                {metrics.newLeads > 0 && (
                  <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.2 text-[10px] text-accent-foreground">
                    {metrics.newLeads}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="audit">Activity</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/70 shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Inquiries
                    </p>
                    <Users className="size-4 text-primary" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{metrics.totalLeads}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-accent">{metrics.newLeads} new</span>{" "}
                    awaiting first contact
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Appointment Requests
                    </p>
                    <Calendar className="size-4 text-accent" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{metrics.totalAppointments}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {metrics.confirmedAppointments} confirmed
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Today's Schedule
                    </p>
                    <Clock className="size-4 text-amber-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{metrics.todayAppointmentsCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Consultations on today's calendar
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Conversion Rate
                    </p>
                    <TrendingUp className="size-4 text-emerald-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{metrics.conversionRate}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Inquiries converted to booked patients
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick action banners */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Upcoming Appointments</span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("appointments")}>
                      View all <ChevronRight className="size-3.5 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointments.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-surface p-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{app.leadName}</p>
                        <p className="text-muted-foreground">{app.serviceName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {formatLongDate(app.appointment_date)} at {app.appointment_time}
                        </p>
                        <Badge
                          variant={
                            app.status === "confirmed"
                              ? "default"
                              : app.status === "requested"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-[10px] mt-0.5"
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Recent Inquiries Requiring Attention</span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("leads")}>
                      View all <ChevronRight className="size-3.5 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leads.slice(0, 4).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-surface p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground">
                            {lead.first_name} {lead.last_name ?? ""}
                          </p>
                          <Badge variant="outline" className="text-[10px]">
                            {lead.urgency}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{lead.treatment_interest}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => handleContactAttempt(lead.id, "call")}
                        >
                          <PhoneCall className="size-3 mr-1" /> Call
                        </Button>
                        <Badge
                          className={
                            lead.status === "new"
                              ? "bg-accent/20 text-accent hover:bg-accent/30"
                              : ""
                          }
                        >
                          {lead.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: APPOINTMENTS */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="Search by patient, phone or treatment..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="size-3.5 text-muted-foreground" />
                <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                  <SelectTrigger className="h-9 w-36 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No-Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-border/60 text-muted-foreground font-medium">
                    <tr>
                      <th className="p-3.5">Patient Details</th>
                      <th className="p-3.5">Treatment</th>
                      <th className="p-3.5">Date & Slot</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Notes</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No appointments match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((app) => (
                        <tr key={app.id} className="hover:bg-surface/50 transition-colors">
                          <td className="p-3.5">
                            <p className="font-semibold text-foreground text-sm">{app.leadName}</p>
                            <p className="text-muted-foreground">{app.leadPhone}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-medium text-foreground">{app.serviceName}</p>
                            <p className="text-muted-foreground">{app.duration_minutes} mins</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-medium text-foreground">
                              {formatLongDate(app.appointment_date)}
                            </p>
                            <p className="text-muted-foreground font-mono">
                              {app.appointment_time} IST
                            </p>
                          </td>
                          <td className="p-3.5">
                            <Select
                              value={app.status}
                              onValueChange={(val) => handleUpdateAppStatus(app.id, val)}
                            >
                              <SelectTrigger className="h-7 w-28 text-[11px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="requested">Requested</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="no_show">No-Show</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3.5 max-w-xs truncate text-muted-foreground">
                            {app.notes || "—"}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            {app.status === "requested" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => handleUpdateAppStatus(app.id, "confirmed")}
                              >
                                <Check className="size-3 mr-1" /> Confirm
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => {
                                setRescheduleDialog({
                                  open: true,
                                  appointmentId: app.id,
                                  patientName: app.leadName,
                                  currentDate: app.appointment_date,
                                  currentTime: app.appointment_time,
                                });
                                setNewDate(app.appointment_date);
                                setNewTime(app.appointment_time);
                              }}
                            >
                              <CalendarClock className="size-3 mr-1" /> Reschedule
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: LEADS */}
          <TabsContent value="leads" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search inquiries by patient, phone or treatment..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="size-3.5 text-muted-foreground" />
                <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                  <SelectTrigger className="h-9 w-36 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-border/60 text-muted-foreground font-medium">
                    <tr>
                      <th className="p-3.5">Lead / Contact</th>
                      <th className="p-3.5">Treatment Interest</th>
                      <th className="p-3.5">Intent & Urgency</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Notes / Summary</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No patient leads match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-surface/50 transition-colors">
                          <td className="p-3.5">
                            <p className="font-semibold text-foreground text-sm">
                              {lead.first_name} {lead.last_name ?? ""}
                            </p>
                            <p className="text-muted-foreground">{lead.phone}</p>
                            {lead.email && (
                              <p className="text-[11px] text-muted-foreground/70">{lead.email}</p>
                            )}
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              {lead.patient_type === "new" ? "New Patient" : "Existing Patient"} ·{" "}
                              {lead.source}
                            </p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-medium text-foreground">{lead.treatment_interest}</p>
                            {lead.reason && (
                              <p className="text-[11px] text-muted-foreground max-w-xs truncate">
                                {lead.reason}
                              </p>
                            )}
                          </td>
                          <td className="p-3.5 space-y-1">
                            <div>
                              <Select
                                value={lead.intent}
                                onValueChange={(val) => handleIntentChange(lead.id, val)}
                              >
                                <SelectTrigger className="h-6 w-32 text-[10px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high_intent">High Intent</SelectItem>
                                  <SelectItem value="considering">Considering</SelectItem>
                                  <SelectItem value="price_shopper">Price Shopper</SelectItem>
                                  <SelectItem value="casual_browser">Casual Browser</SelectItem>
                                  <SelectItem value="unknown">Unknown</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Badge
                              variant={
                                lead.urgency === "emergency"
                                  ? "destructive"
                                  : lead.urgency === "urgent"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-[10px]"
                            >
                              {lead.urgency}
                            </Badge>
                          </td>
                          <td className="p-3.5">
                            <Select
                              value={lead.status}
                              onValueChange={(val) => handleStatusChange(lead.id, val)}
                            >
                              <SelectTrigger className="h-7 w-28 text-[11px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="booked">Booked</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                              </SelectContent>
                            </Select>
                            {lead.last_contacted_at && (
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                Contacted:{" "}
                                {new Date(lead.last_contacted_at).toLocaleDateString("en-IN")}
                              </p>
                            )}
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <p className="truncate text-muted-foreground text-[11px]">
                              {lead.conversation_summary || "No notes yet"}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setNoteDialog({
                                  open: true,
                                  leadId: lead.id,
                                  leadName: `${lead.first_name} ${lead.last_name ?? ""}`.trim(),
                                });
                              }}
                              className="mt-1 text-[11px] text-primary hover:underline font-medium"
                            >
                              + Add Note
                            </button>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => handleContactAttempt(lead.id, "call")}
                            >
                              <PhoneCall className="size-3 mr-1" /> Log Call
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => handleContactAttempt(lead.id, "whatsapp")}
                            >
                              <MessageCircle className="size-3 mr-1" /> WhatsApp
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: AUDIT LOGS */}
          <TabsContent value="audit" className="space-y-4">
            <Card className="border-border/80 shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  <span>Audit Trail & Event History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/40">
                  {activityLogs.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">
                      No activity logs recorded yet.
                    </p>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="py-3 flex items-start justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{log.action}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {log.entity_type}
                            </Badge>
                          </div>
                          {log.details && (
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                              {JSON.stringify(log.details)}
                            </p>
                          )}
                        </div>
                        <span className="text-muted-foreground whitespace-nowrap text-[11px]">
                          {new Date(log.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Note Dialog */}
      <Dialog
        open={noteDialog.open}
        onOpenChange={(open) => !open && setNoteDialog({ open: false, leadId: "", leadName: "" })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note for {noteDialog.leadName}</DialogTitle>
            <DialogDescription>
              Record clinical notes, consultation discussions, or scheduling requests.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="lead-note-input">Note Content</Label>
            <Textarea
              id="lead-note-input"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="e.g. Patient called asking about clear aligner duration. Quoted fictional package."
              rows={4}
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNoteDialog({ open: false, leadId: "", leadName: "" })}
            >
              Cancel
            </Button>
            <Button disabled={savingNote || !newNoteText.trim()} onClick={handleSaveNote}>
              {savingNote ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialog.open}
        onOpenChange={(open) =>
          !open &&
          setRescheduleDialog({
            open: false,
            appointmentId: "",
            patientName: "",
            currentDate: "",
            currentTime: "",
          })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Modify date and slot for {rescheduleDialog.patientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div>
              <Label htmlFor="resched-date">New Date</Label>
              <Input
                id="resched-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="resched-time">New Slot (HH:MM)</Label>
              <Input
                id="resched-time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="11:30"
                className="mt-1 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRescheduleDialog({
                  open: false,
                  appointmentId: "",
                  patientName: "",
                  currentDate: "",
                  currentTime: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              disabled={savingReschedule || !newDate || !newTime}
              onClick={handleSaveReschedule}
            >
              {savingReschedule ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
