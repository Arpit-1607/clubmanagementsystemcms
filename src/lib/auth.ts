import { supabase } from "@/integrations/supabase/client";

const ADJECTIVES = ["Swift", "Silent", "Bright", "Cosmic", "Stellar", "Quantum", "Neon", "Cyber", "Epic", "Bold"];
const NOUNS = ["Coder", "Spark", "Rider", "Phoenix", "Falcon", "Viper", "Wolf", "Hawk", "Storm", "Blaze"];

export function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
}

export const STUDENT_ACCESS_CODE = "CLUB2026";
export const ADMIN_ACCESS_CODE = "ADMIN2026";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function createProfile(userId: string, nickname: string, role: 'student' | 'club_admin', email?: string) {
  const { error } = await supabase.from('profiles').insert({
    user_id: userId,
    nickname,
    role,
    email: email || null,
  });
  if (error && error.code !== '23505') throw error;
}

export async function assignRole(userId: string, role: 'student' | 'club_admin') {
  const { error } = await supabase.from('user_roles' as any).insert({
    user_id: userId,
    role,
  });
  if (error && error.code !== '23505') throw error;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
