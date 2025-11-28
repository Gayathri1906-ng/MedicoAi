import { useState } from "react";
import { Activity, FileText, Stethoscope, History, LogOut, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import SymptomsPage from "./SymptomsPage";
import ReportPage from "./ReportPage";
import DoctorsPage from "./DoctorsPage";
import HistoryPage from "./HistoryPage";

const MainLayout = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("symptoms");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MedicoAi
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="symptoms" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Activity className="h-5 w-5" />
              <span>Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <FileText className="h-5 w-5" />
              <span>Report</span>
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Stethoscope className="h-5 w-5" />
              <span>Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <History className="h-5 w-5" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms">
            <SymptomsPage />
          </TabsContent>
          <TabsContent value="report">
            <ReportPage />
          </TabsContent>
          <TabsContent value="doctors">
            <DoctorsPage />
          </TabsContent>
          <TabsContent value="history">
            <HistoryPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MainLayout;
