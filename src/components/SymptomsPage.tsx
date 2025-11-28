import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Sparkles, TrendingUp, Activity as ActivityIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-medical.jpg";
import HealthTips from "./HealthTips";

const commonSymptoms = [
  "Fever", "Headache", "Cough", "Sore throat", "Fatigue",
  "Nausea", "Dizziness", "Chest pain", "Shortness of breath", "Rash"
];

const SymptomsPage = () => {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState<string>("medium");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const addSymptom = (symptom: string) => {
    if (symptoms.trim()) setSymptoms(prev => prev + ", " + symptom);
    else setSymptoms(symptom);
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be logged in");

      // --- FAST RETRIEVAL: Check Supabase first ---
      const { data: cached } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .eq("symptoms", symptoms)
        .limit(1)
        .single();

      if (cached) {
        setAnalysis(cached.analysis_result);
        toast.success("Loaded previous analysis!");
      } else {
        // --- Call Edge Function ---
        const { data, error } = await supabase.functions.invoke("analyze-symptoms", {
          method: "POST",
          body: JSON.stringify({ symptoms, severity, user_id: user.id }),
        });
        if (error) throw error;

        const safeData = {
          summary: data?.summary || "No summary available",
          conditions: data?.conditions || ["Consult a healthcare professional"],
          actions: data?.actions || ["Seek professional medical advice"],
          when_to_visit: data?.when_to_visit || "Consult a doctor if symptoms persist",
          risk_level: ["high", "medium"].includes(data?.risk_level?.toLowerCase() || "") 
            ? data.risk_level.toLowerCase() 
            : "low",
          medicines: data?.medicines || [],
        };

        // --- Save for future fast retrieval ---
        await supabase.from("analyses").insert([{
          user_id: user.id,
          symptoms,
          analysis_result: safeData,
          risk_level: safeData.risk_level,
          created_at: new Date().toISOString()
        }]);

        setAnalysis(safeData);
        toast.success("Analysis complete!");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <HealthTips />

      <div className="relative overflow-hidden rounded-2xl shadow-glow animate-in slide-in-from-top duration-700">
        <img src={heroImage} alt="Medical AI Assistant" className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 flex items-center justify-center">
          <div className="text-center text-white space-y-2">
            <Sparkles className="h-12 w-12 mx-auto mb-2 animate-pulse" />
            <h2 className="text-3xl font-bold drop-shadow-lg">AI-Powered Symptom Checker</h2>
            <p className="text-sm opacity-90">Get instant health insights</p>
          </div>
        </div>
      </div>

      <Card className="shadow-glow border-primary/20 animate-in slide-in-from-bottom duration-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Check Your Symptoms</CardTitle>
          </div>
          <CardDescription>
            Describe your symptoms and select severity for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Quick Add Common Symptoms</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <Badge 
                  key={symptom}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
                  onClick={() => addSymptom(symptom)}
                >
                  + {symptom}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms" className="text-base font-semibold">Describe Your Symptoms</Label>
            <Textarea
              id="symptoms"
              placeholder="E.g., I have a red rash on my arm for three days..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={5}
              className="resize-none border-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity" className="text-base font-semibold">Symptom Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="severity" className="border-primary/20">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-gradient-primary hover:opacity-90 h-12 text-base font-semibold shadow-lg hover:shadow-glow transition-all duration-300"
          >
            {analyzing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Analyze Symptoms"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="shadow-glow border-l-4 border-l-primary animate-in slide-in-from-bottom duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertCircle className="h-6 w-6 text-primary animate-pulse" />
              AI Analysis Results
            </CardTitle>
            <CardDescription>Based on the symptoms you described</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Possible Conditions</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {analysis.conditions?.map((c: any, i: number) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Suggested Actions</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {analysis.actions?.map((a: any, i: number) => <li key={i}>{a}</li>)}
              </ul>
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <span className="font-semibold">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                analysis.risk_level === 'high' ? 'bg-destructive text-destructive-foreground' :
                analysis.risk_level === 'medium' ? 'bg-yellow-500 text-white' :
                'bg-success text-success-foreground'
              }`}>
                {analysis.risk_level?.toUpperCase()}
              </span>
            </div>
            {analysis.when_to_visit && (
              <div className="p-4 bg-accent/10 rounded-lg">
                <h3 className="font-semibold mb-2">When to Visit a Doctor</h3>
                <p className="text-muted-foreground">{analysis.when_to_visit}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SymptomsPage;
