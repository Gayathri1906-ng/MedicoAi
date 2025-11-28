import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const healthTipsData = [
  {
    title: "Stay Hydrated",
    tip: "Drink at least 8 glasses of water daily to maintain proper body function and energy levels.",
  },
  {
    title: "Regular Exercise",
    tip: "Aim for 30 minutes of moderate exercise daily to improve cardiovascular health and boost mood.",
  },
  {
    title: "Quality Sleep",
    tip: "Get 7-9 hours of quality sleep each night to support immune function and mental health.",
  },
  {
    title: "Balanced Diet",
    tip: "Include fruits, vegetables, whole grains, and lean proteins in your daily meals for optimal nutrition.",
  },
  {
    title: "Stress Management",
    tip: "Practice mindfulness, meditation, or deep breathing exercises to reduce daily stress levels.",
  },
  {
    title: "Regular Check-ups",
    tip: "Schedule annual health screenings and dental check-ups to catch potential issues early.",
  },
  {
    title: "Hand Hygiene",
    tip: "Wash your hands frequently with soap for at least 20 seconds to prevent illness.",
  },
  {
    title: "Limit Screen Time",
    tip: "Take regular breaks from screens every 20 minutes and avoid screens before bedtime.",
  },
  {
    title: "Social Connections",
    tip: "Maintain strong social relationships as they contribute to better mental and physical health.",
  },
  {
    title: "Limit Processed Foods",
    tip: "Reduce intake of processed foods and added sugars to lower risk of chronic diseases.",
  },
];

const HealthTips = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    // Set a random tip on mount
    setCurrentTip(Math.floor(Math.random() * healthTipsData.length));
  }, []);

  const getNewTip = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * healthTipsData.length);
    } while (newIndex === currentTip && healthTipsData.length > 1);
    setCurrentTip(newIndex);
  };

  const tip = healthTipsData[currentTip];

  return (
    <Card className="shadow-lg border-l-4 border-l-accent bg-gradient-to-br from-accent/5 to-primary/5 animate-in fade-in slide-in-from-right duration-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent animate-pulse" />
            <CardTitle className="text-lg">Daily Health Tip</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={getNewTip}
            className="h-8 w-8 hover:bg-accent/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">{tip.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{tip.tip}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthTips;
