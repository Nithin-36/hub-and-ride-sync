import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nirtfplbqialiceboqnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcnRmcGxicWlhbGljZWJvcW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTYyMzQsImV4cCI6MjA2NTE5MjIzNH0.EknZUpFcPcqfMdfczYevwCGerBIOlDlU6XsC02vv46Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);