-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add new columns to profiles table if they don't exist
DO $$ 
BEGIN
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS website text,
    ADD COLUMN IF NOT EXISTS siret text,
    ADD COLUMN IF NOT EXISTS vat_number text,
    ADD COLUMN IF NOT EXISTS logo_url text;
END $$;
