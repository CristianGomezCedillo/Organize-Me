import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.com/dashboard/project/btxndlpyarhrgeggpily';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eG5kbHB5YXJocmdlZ2dwaWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3Mzg1MzcsImV4cCI6MjA0MzMxNDUzN30.m50-GZpEKEgAuW4Q3oEHFbJxCQ-QbdWdBayNTpcsZLE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
