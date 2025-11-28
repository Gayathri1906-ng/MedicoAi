-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create doctor chats table
CREATE TABLE public.doctor_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'doctor')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create medical reports table
CREATE TABLE public.medical_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_image_url TEXT NOT NULL,
  extracted_data JSONB NOT NULL,
  report_type TEXT,
  report_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY "Users can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for doctor_chats
CREATE POLICY "Users can view chats for their appointments"
  ON public.doctor_chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can send messages in their chats"
  ON public.doctor_chats FOR INSERT
  WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

-- RLS Policies for medical_reports
CREATE POLICY "Users can view their own medical reports"
  ON public.medical_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own medical reports"
  ON public.medical_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical reports"
  ON public.medical_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for appointments updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for doctor chats
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_chats;