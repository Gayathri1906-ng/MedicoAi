import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, Calendar, Loader2, MessageSquare, Search, Filter, TrendingUp, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AppointmentModal from "./AppointmentModal";
import DoctorChatModal from "./DoctorChatModal";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  location: string;
  rating: number;
  available: boolean;
}

interface Appointment {
  id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = [...doctors];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query) ||
          doctor.location.toLowerCase().includes(query)
      );
    }

    // Apply specialty filter
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    // Apply favorites filter
    if (viewMode === "favorites") {
      filtered = filtered.filter((doctor) => favorites.has(doctor.id));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "experience") {
        const aYears = parseInt(a.experience.match(/\d+/)?.[0] || "0");
        const bYears = parseInt(b.experience.match(/\d+/)?.[0] || "0");
        return bYears - aYears;
      }
      return 0;
    });

    setFilteredDoctors(filtered);
  }, [searchQuery, doctors, selectedSpecialty, sortBy, viewMode, favorites]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("available", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
      setFilteredDoctors(data || []);
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["confirmed", "pending"])
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
  };

  const handleOpenChat = (doctor: Doctor) => {
    const appointment = appointments.find(apt => apt.doctor_id === doctor.id);
    if (appointment) {
      setSelectedDoctor(doctor);
      setSelectedAppointment(appointment);
      setChatModalOpen(true);
    } else {
      toast.error("Please book an appointment first to chat with the doctor");
    }
  };

  const toggleFavorite = (doctorId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(doctorId)) {
        newFavorites.delete(doctorId);
        toast.success("Removed from favorites");
      } else {
        newFavorites.add(doctorId);
        toast.success("Added to favorites");
      }
      return newFavorites;
    });
  };

  const specialties = Array.from(new Set(doctors.map((d) => d.specialty)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Available Doctors
          </CardTitle>
          <CardDescription>
            Find and book appointments with qualified healthcare professionals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters and Sorting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Specialty
              </label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">View</label>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "all" | "favorites")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All ({doctors.length})</TabsTrigger>
                  <TabsTrigger value="favorites">
                    <Heart className="h-4 w-4 mr-1" />
                    Favorites ({favorites.size})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{filteredDoctors.length} doctors found</Badge>
          </div>
        </CardContent>
      </Card>

      {filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No doctors found matching your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => {
          const hasAppointment = appointments.some(apt => apt.doctor_id === doctor.id);
          const isFavorite = favorites.has(doctor.id);
          
          return (
            <Card key={doctor.id} className="shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toggleFavorite(doctor.id)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  }`}
                />
              </Button>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 bg-gradient-primary ring-2 ring-primary/20">
                    <AvatarFallback className="text-lg font-semibold text-primary-foreground">
                      {doctor.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {doctor.specialty}
                    </Badge>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{doctor.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground ml-1">(50+ reviews)</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{doctor.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{doctor.location}</span>
                  </div>
                  {hasAppointment && (
                    <Badge variant="outline" className="w-full justify-center border-green-500 text-green-600">
                      ✓ Appointment Booked
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBookAppointment(doctor)}
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                    size="sm"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book
                  </Button>
                  <Button
                    onClick={() => handleOpenChat(doctor)}
                    variant={hasAppointment ? "outline" : "secondary"}
                    disabled={!hasAppointment}
                    size="sm"
                    className="flex-1"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {selectedDoctor && (
        <>
          <AppointmentModal
            open={bookingModalOpen}
            onOpenChange={setBookingModalOpen}
            doctor={selectedDoctor}
          />
          {selectedAppointment && (
            <DoctorChatModal
              open={chatModalOpen}
              onOpenChange={setChatModalOpen}
              appointment={selectedAppointment}
              doctorName={selectedDoctor.name}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DoctorsPage;
