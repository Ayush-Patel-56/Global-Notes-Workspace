// Initialize Supabase Client using Global Object (Robust & Browser-Compatible)
// Fallback to window.supabase which is loaded via script tag in index.html - DO NOT REVERT TO ESM IMPORT
const { createClient } = window.supabase;

const SUPABASE_URL = 'https://mxupkyhaurqobcnaqltw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dXBreWhhdXJxb2JjbmFxbHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzg2NDcsImV4cCI6MjA4NDcxNDY0N30.fjjXNaxiRrRnLf-Mq5KeCZqyb_YuNYuE8de2gioyAvs';

// Create a single instance of the client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Optional: Log to verify init
console.log("Supabase Client Initialized via Global (v2)");

export { supabase };
