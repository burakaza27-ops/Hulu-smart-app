/**
 * Abyssinia Supabase Auth Helper
 * Provides sign-up, sign-in (phone OTP + email), session management, and profile sync.
 * Falls back gracefully when Supabase is not configured.
 */
import supabase, { isSupabaseConfigured } from './supabase';

/**
 * Check if we have an active Supabase session
 */
export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user
 */
export async function getUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign up with email + password
 */
export async function signUpEmail(email, password, fullName) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  return { data, error };
}

/**
 * Sign in with email + password
 */
export async function signInEmail(email, password) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/**
 * Send OTP to phone number (Ethiopian format: +251...)
 */
export async function sendPhoneOTP(phone) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  return { data, error };
}

/**
 * Verify phone OTP
 */
export async function verifyPhoneOTP(phone, token) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  return { data, error };
}

/**
 * Sign out
 */
export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

/**
 * Get user profile from profiles table
 */
export async function getProfile(userId) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

/**
 * Fetch user's transactions from Supabase
 */
export async function fetchTransactions(userId, limit = 50) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data;
}

/**
 * Insert a new transaction
 */
export async function insertTransaction(userId, tx) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      title: tx.title,
      subtitle: tx.subtitle,
      amount: tx.amount,
      type: tx.type,
      ref_id: tx.refId,
    })
    .select()
    .single();
  if (error) return null;
  return data;
}

/**
 * Fetch user's documents (Vault)
 */
export async function fetchDocuments(userId) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

/**
 * Upload a document to Vault storage
 */
export async function uploadDocument(userId, file, metadata) {
  if (!isSupabaseConfigured()) return null;
  const filePath = `${userId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('vault-documents')
    .upload(filePath, file);
  if (uploadError) return null;

  const { data: urlData } = supabase.storage
    .from('vault-documents')
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      title: metadata.title,
      subtitle: metadata.subtitle || 'Uploaded document',
      doc_type: metadata.type || 'Legal',
      file_url: urlData.publicUrl,
      verified: false,
      color: metadata.color || '#8B5CF6',
    })
    .select()
    .single();
  if (error) return null;
  return data;
}

/**
 * Fetch beneficiaries
 */
export async function fetchBeneficiaries(userId) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

/**
 * Fetch notifications
 */
export async function fetchNotifications(userId) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}
