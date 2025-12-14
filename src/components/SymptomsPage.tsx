import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Activity as ActivityIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-medical.jpg";
import HealthTips from "./HealthTips";

const commonSymptoms = [
  "Fever",
  "Headache",
  "Cough",
  "Sore throat",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Chest pain",
  "Shortness of breath",
  "Rash",
];

type AnalysisResult = {
  summary: string;
  conditions: string[];
  actions: string[];
  precautions: string[];
  prevention: string[];
  when_to_visit: string;
  risk_level: "low" | "medium" | "high";
  medicines?: string[];
};

const SymptomsPage = () => {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState<string>("medium");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const addSymptom = (symptom: string) => {
    setSymptoms((prev) =>
      prev.trim() ? `${prev}, ${symptom}` : symptom
    );
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in");
      }

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke(
        "analyze-symptoms",
        {
          method: "POST",
          body: JSON.stringify({
            symptoms,
            severity,
            user_id: user.id,
          }),
        }
      );

      if (error) throw error;

      // Trust AI response (validated in backend)
      const aiResult: AnalysisResult = {
        summary: data.summary,
        conditions: data.conditions,
        actions: data.actions,
        precautions: data.precautions,
        prevention: data.prevention,
        when_to_visit: data.when_to_visit,
        risk_level: data.risk_level,
        medicines: data.medicines,
      };

      setAnalysis(aiResult);
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast.error(
        err.message || "Failed to analyze symptoms"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <HealthTips />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl shadow-glow">
        <img
          src={heroImage}
          alt="Medical AI Assistant"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 flex items-center justify-center">
          <div className="text-center text-white space-y-2">
            <Sparkles className="h-12 w-12 mx-auto animate-pulse" />
            <h2 className="text-3xl font-bold">
              AI-Powered Symptom Checker
            </h2>
            <p className="text-sm opacity-90">
              Get instant health insights
            </p>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <Card className="shadow-glow border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">
              Check Your Symptoms
            </CardTitle>
          </div>
          <CardDescription>
            Describe symptoms and select severity
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Add */}
          <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">
                Quick Add Common Symptoms
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <Badge
                  key={symptom}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addSymptom(symptom)}
                >
                  + {symptom}
                </Badge>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <Label className="font-semibold">
              Describe Your Symptoms
            </Label>
            <Textarea
              value={symptoms}
              onChange={(e) =>
                setSymptoms(e.target.value)
              }
              rows={5}
              placeholder="Example: mild fever with headache..."
            />
          </div>

          {/* Severity */}
          <div>
            <Label className="font-semibold">
              Symptom Severity
            </Label>
            <Select
              value={severity}
              onValueChange={setSeverity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">
                  Mild
                </SelectItem>
                <SelectItem value="medium">
                  Medium
                </SelectItem>
                <SelectItem value="severe">
                  Severe
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full h-12"
          >
            {analyzing ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Analyze Symptoms"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysis && (
        <Card className="shadow-glow border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-primary" />
              AI Analysis Results
            </CardTitle>
            <CardDescription>
              Based on provided symptoms
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Section title="Summary">
              {analysis.summary}
            </Section>

            <ListSection
              title="Possible Conditions"
              items={analysis.conditions}
            />

            <ListSection
              title="Suggested Actions"
              items={analysis.actions}
            />

            <ListSection
              title="Precautions"
              items={analysis.precautions}
            />

            <ListSection
              title="Prevention"
              items={analysis.prevention}
            />

            <div className="p-3 rounded bg-primary/10">
              <strong>Risk Level:</strong>{" "}
              {analysis.risk_level.toUpperCase()}
            </div>

            <Section title="When to Visit a Doctor">
              {analysis.when_to_visit}
            </Section>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ---------- Helper Components ----------
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

const ListSection = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => (
  <div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <ul className="list-disc list-inside text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </div>
);

export default SymptomsPage;
