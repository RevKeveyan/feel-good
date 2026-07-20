
-- Profiles: onboarding completion
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Onboarding responses
CREATE TABLE public.onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  goals TEXT[] NOT NULL DEFAULT '{}',
  why_joined TEXT,
  why_change TEXT,
  want_to_feel TEXT,
  success_looks_like TEXT,
  why_statement TEXT,
  future_letter TEXT,
  commitment_name TEXT,
  commitment_signed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_responses TO authenticated;
GRANT ALL ON public.onboarding_responses TO service_role;
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own onboarding all" ON public.onboarding_responses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER onboarding_responses_updated_at BEFORE UPDATE ON public.onboarding_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Transformation wheel
CREATE TABLE public.transformation_wheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('day_1','day_55')),
  energy INTEGER NOT NULL,
  confidence INTEGER NOT NULL,
  mood INTEGER NOT NULL,
  stress INTEGER NOT NULL,
  digestion INTEGER NOT NULL,
  fitness INTEGER NOT NULL,
  motivation INTEGER NOT NULL,
  consistency INTEGER NOT NULL,
  overall_health INTEGER NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, phase)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transformation_wheel TO authenticated;
GRANT ALL ON public.transformation_wheel TO service_role;
ALTER TABLE public.transformation_wheel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own wheel all" ON public.transformation_wheel
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER transformation_wheel_updated_at BEFORE UPDATE ON public.transformation_wheel
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Vision board items
CREATE TABLE public.vision_board_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vision_board_items TO authenticated;
GRANT ALL ON public.vision_board_items TO service_role;
ALTER TABLE public.vision_board_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own vision items all" ON public.vision_board_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER vision_board_items_updated_at BEFORE UPDATE ON public.vision_board_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Struggle moments
CREATE TABLE public.struggle_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_taken TEXT NOT NULL CHECK (action_taken IN ('breathwork','tiny_task','reframe','quote','community')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.struggle_moments TO authenticated;
GRANT ALL ON public.struggle_moments TO service_role;
ALTER TABLE public.struggle_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own struggle all" ON public.struggle_moments
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Vision board storage RLS
CREATE POLICY "Vision board owner select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vision-board' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Vision board owner insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vision-board' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Vision board owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'vision-board' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Vision board owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vision-board' AND auth.uid()::text = (storage.foldername(name))[1]);
