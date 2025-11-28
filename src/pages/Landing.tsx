import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Brain, FileText, Stethoscope, MessageSquare, ArrowRight, Shield, Zap, Loader2, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import heroImage from "@/assets/hero-medical.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/app");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/app");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;
      toast.success("Account created successfully! Please sign in.");
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success("Signed in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Symptom Analysis",
      description: "Get instant AI-powered analysis of your symptoms with personalized recommendations"
    },
    {
      icon: FileText,
      title: "Medical Report Upload",
      description: "Upload and digitize your medical reports with intelligent data extraction"
    },
    {
      icon: Stethoscope,
      title: "Doctor Network",
      description: "Connect with qualified doctors and book appointments easily"
    },
    {
      icon: MessageSquare,
      title: "Complete History",
      description: "Track all your health data, appointments, and medical records in one place"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is encrypted and protected with industry-standard security"
    },
    {
      icon: Zap,
      title: "Fast & Accurate",
      description: "Powered by advanced AI models for quick and reliable health insights"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
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
            <Button 
              variant="ghost"
              onClick={() => setShowAuthDialog(true)}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => setShowAuthDialog(true)}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Welcome to MedicoAi</DialogTitle>
            <DialogDescription className="text-center">
              Sign in or create an account to get started
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-signup">Display Name</Label>
                  <Input
                    id="name-signup"
                    type="text"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Healthcare</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Your Personal{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Medical AI
                </span>{" "}
                Assistant
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Get instant symptom analysis, manage your health records, and connect with healthcare professionals—all powered by advanced AI technology.
              </p>
              
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 text-lg h-12 px-8"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg h-12 px-8"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Sign In
                </Button>
              </div>
            </div>
            
            <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-300">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20" />
              <img 
                src={heroImage} 
                alt="Medical AI Assistant" 
                className="relative rounded-3xl shadow-glow w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-bold">
              Everything You Need for{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Better Health
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare tools powered by AI to help you make informed decisions about your health
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <Card className="shadow-glow max-w-4xl mx-auto text-center">
            <CardContent className="pt-12 pb-12 space-y-6">
              <h2 className="text-4xl font-bold">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of users who trust MedicoAi for their healthcare needs
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-lg h-12 px-8"
                onClick={() => setShowAuthDialog(true)}
              >
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MedicoAi. Your trusted AI healthcare companion.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
