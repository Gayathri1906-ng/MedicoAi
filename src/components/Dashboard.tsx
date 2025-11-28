import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, AlertTriangle, Ambulance, Shield, Phone, Plus, Trash2, MapPin } from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface HealthReminder {
  id: string;
  title: string;
  date: string;
  note?: string;
}

const Dashboard = () => {
  // --- Emergency Numbers ---
  const emergencyNumbers = [
    { icon: Ambulance, label: "Emergency", number: "911", color: "text-red-500 bg-red-500/10" },
    { icon: Shield, label: "Police", number: "100", color: "text-blue-500 bg-blue-500/10" },
    { icon: Phone, label: "Helpline", number: "108", color: "text-green-500 bg-green-500/10" },
  ];

  const callNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  // --- Personal Emergency Contacts ---
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "Dr. Smith", phone: "+1 555-0123", relation: "Primary Doctor" },
  ]);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Please fill in name and phone number");
      return;
    }
    const contact: EmergencyContact = { id: Date.now().toString(), ...newContact };
    setContacts([...contacts, contact]);
    setNewContact({ name: "", phone: "", relation: "" });
    setContactDialogOpen(false);
    toast.success("Emergency contact added");
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    toast.success("Contact removed");
  };

  // --- Health Reminders ---
  const [reminders, setReminders] = useState<HealthReminder[]>([
    { id: "1", title: "Blood Test", date: "2025-12-05", note: "Fasting required" },
    { id: "2", title: "Annual Checkup", date: "2026-01-15" },
  ]);

  const [newReminder, setNewReminder] = useState({ title: "", date: "", note: "" });
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

  const addReminder = () => {
    if (!newReminder.title || !newReminder.date) {
      toast.error("Please enter title and date");
      return;
    }
    const reminder: HealthReminder = { id: Date.now().toString(), ...newReminder };
    setReminders([...reminders, reminder]);
    setNewReminder({ title: "", date: "", note: "" });
    setReminderDialogOpen(false);
    toast.success("Reminder added");
  };

  // --- Location-based nearest hospitals ---
  const [nearestHospital, setNearestHospital] = useState<{ name: string; distance: string } | null>(null);

  const navigateHospital = () => {
    if (nearestHospital) {
      const query = encodeURIComponent(nearestHospital.name);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Emergency Numbers
          </CardTitle>
          <CardDescription>Quick access to emergency services</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {emergencyNumbers.map((item, idx) => (
            <button
              key={idx}
              onClick={() => callNumber(item.number)}
              className={`flex flex-col items-center justify-center gap-1 p-4 rounded-lg font-medium ${item.color} hover:scale-105 transition-transform`}
            >
              <item.icon className="h-7 w-7" />
              <span className="text-sm">{item.label}</span>
              <span className="text-lg font-bold">{item.number}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Personal Emergency Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal Emergency Contacts
            </CardTitle>
            <CardDescription>Your trusted contacts for emergencies</CardDescription>
          </div>
          <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Label>Name</Label>
                <Input
                  placeholder="Contact name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
                <Label>Phone Number</Label>
                <Input
                  placeholder="+1 555-0000"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
                <Label>Relation</Label>
                <Input
                  placeholder="Family / Doctor"
                  value={newContact.relation}
                  onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                />
                <Button onClick={addContact} className="w-full bg-gradient-primary">Add Contact</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No emergency contacts added yet</p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contact.relation && <Badge variant="secondary">{contact.relation}</Badge>}
                    <Button size="icon" variant="ghost" className="text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => callNumber(contact.phone)}>
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeContact(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Reminders */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Health Reminders</CardTitle>
            <CardDescription>Upcoming checkups and lab tests</CardDescription>
          </div>
          <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary">Add Reminder</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Health Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Label>Title</Label>
                <Input
                  placeholder="Checkup or Test Name"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newReminder.date}
                  onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                />
                <Label>Note (optional)</Label>
                <Input
                  placeholder="Fasting required / other notes"
                  value={newReminder.note}
                  onChange={(e) => setNewReminder({ ...newReminder, note: e.target.value })}
                />
                <Button onClick={addReminder} className="w-full bg-gradient-primary">Add Reminder</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {reminders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No health reminders added yet</p>
          ) : (
            reminders.map((reminder) => (
              <div key={reminder.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">{reminder.title}</p>
                  <p className="text-sm text-muted-foreground">{reminder.date} {reminder.note && `- ${reminder.note}`}</p>
                </div>
                <Button size="sm" className="bg-gradient-primary" onClick={() => toast("Reminder acknowledged")}>Done</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Health Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Quick Actions</CardTitle>
          <CardDescription>Instant access to emergency and navigation</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button onClick={navigateHospital} className="flex items-center justify-center gap-2 bg-gradient-primary">
            <MapPin className="h-5 w-5" /> Navigate to Nearest Hospital
          </Button>
          <Button onClick={() => toast("Ambulance requested")} className="flex items-center justify-center gap-2 bg-red-500 text-white">
            <Ambulance className="h-5 w-5" /> Request Ambulance
          </Button>
          <Button onClick={() => toast("Family notified")} className="flex items-center justify-center gap-2 bg-yellow-500 text-white">
            <User className="h-5 w-5" /> Notify Family/Friends
          </Button>
          <Button onClick={() => toast("Doctor called")} className="flex items-center justify-center gap-2 bg-green-500 text-white">
            <Phone className="h-5 w-5" /> Call Doctor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
