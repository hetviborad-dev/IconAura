import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://nekvkaquyfvygstytbfv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5la3ZrYXF1eWZ2eWdzdHl0YmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjQzOTQsImV4cCI6MjEwNzIwMDM5NH0.EI-PezDvOyiMHbT9FGJdlAuQ7PAeUMW2zabAAgGQNVE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
