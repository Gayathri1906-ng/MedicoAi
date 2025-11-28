import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Appointment {
  id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
}

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

interface DoctorChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  doctorName: string;
}

const DoctorChatModal = ({ open, onOpenChange, appointment, doctorName }: DoctorChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [open, appointment.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("doctor_chats")
        .select("*")
        .eq("appointment_id", appointment.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load chat history");
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`doctor_chat_${appointment.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "doctor_chats",
          filter: `appointment_id=eq.${appointment.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    const messageText = input;
    setInput("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("doctor_chats").insert({
        appointment_id: appointment.id,
        user_id: user.id,
        doctor_id: appointment.doctor_id,
        sender_type: "user",
        message: messageText,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Send message error:", error);
      toast.error(error.message || "Failed to send message");
      setInput(messageText);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Chat with {doctorName}
          </DialogTitle>
          <DialogDescription>
            Appointment: {format(new Date(appointment.appointment_date), "PPP")} at {appointment.appointment_time}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender_type === "user"
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(message.created_at), "p")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-gradient-primary"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorChatModal;
