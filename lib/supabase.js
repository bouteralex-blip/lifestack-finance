import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynvfzssakggmmldjkmes.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludmZ6c3Nha2dnbW1sZGprbWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODU5NTcsImV4cCI6MjA4ODc2MTk1N30.9JenIs9D8B8hmOGQLrLUN5lBZnDr0e9f1qKIIOXZFp4';

export const supabase = createClient(supabaseUrl, supabaseKey);
