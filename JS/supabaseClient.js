// Initialize Supabase Client using ESM import (Robust & Modern)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://mxupkyhaurqobcnaqltw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dXBreWhhdXJxb2JjbmFxbHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzg2NDcsImV4cCI6MjA4NDcxNDY0N30.fjjXNaxiRrRnLf-Mq5KeCZqyb_YuNYuE8de2gioyAvs';

// Create a single instance of the client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Optional: Log to verify init
console.log("Supabase Client Initialized");

export { supabase };
