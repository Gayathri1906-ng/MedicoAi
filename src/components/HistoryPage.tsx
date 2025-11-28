import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Activity, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface UnifiedHistoryItem {
  id: string;
  type: "appointment" | "symptom_analysis";
  title: string;
  dateTime: string;
  details: any;
}

const HistoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<UnifiedHistoryItem[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not logged in");

      // --- Fetch Appointments ---
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id, doctor_id, appointment_date, appointment_time, status, reason, notes, created_at")
        .eq("user_id", user.id);
      if (appointmentsError) throw appointmentsError;

      const appointments = (appointmentsData || []).map((a: any) => ({
        id: a.id,
        type: "appointment",
        title: "Doctor Appointment",
        dateTime: new Date(`${a.appointment_date}T${a.appointment_time}`).toISOString(),
        details: a
      }));

      // --- Fetch Symptom Analyses ---
      const { data: analysesData, error: analysesError } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id);
      if (analysesError) throw analysesError;

      const analyses = (analysesData || []).map((a: any) => ({
        id: a.id,
        type: "symptom_analysis",
        title: "Symptom Analysis",
        dateTime: new Date(a.created_at).toISOString(),
        details: a
      }));

      // --- Combine and sort ---
      const combined = [...appointments, ...analyses].sort(
        (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );

      setHistory(combined);
    } catch (err: any) {
      console.error("Error fetching history:", err);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Your History</CardTitle>
          <CardDescription>Appointments and Symptom Analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4 space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No history available yet</p>
              </div>
            ) : (
              history.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{item.title}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(new Date(item.dateTime), "MMM dd, yyyy 'at' HH:mm")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.type === "appointment" && (
                      <>
                        <p><strong>Reason:</strong> {item.details.reason}</p>
                        <p><strong>Status:</strong> {item.details.status}</p>
                        {item.details.notes && <p><strong>Notes:</strong> {item.details.notes}</p>}
                      </>
                    )}
                    {item.type === "symptom_analysis" && (
                      <>
                        <p><strong>Symptoms:</strong> {item.details.symptoms}</p>
                        <p><strong>Summary:</strong> {item.details.analysis_result.summary}</p>
                        <p><strong>Conditions:</strong> {item.details.analysis_result.conditions.join(", ")}</p>
                        <p><strong>Risk Level:</strong> {item.details.analysis_result.risk_level}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
