-- HULU Smart Service Hub — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  address TEXT,
  hulu_id TEXT UNIQUE DEFAULT ('HLU-' || floor(random() * 9000 + 1000)::int || '-' || floor(random() * 90 + 10)::int),
  kyc_level INT DEFAULT 0,
  avatar_initials TEXT DEFAULT 'HU',
  language TEXT DEFAULT 'en',
  biometric_enabled BOOLEAN DEFAULT true,
  two_fa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. ACCOUNTS (bank accounts linked to a user)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL DEFAULT 'Abyssinia Bank',
  account_type TEXT NOT NULL DEFAULT 'Savings',
  account_number TEXT NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bill', 'income', 'transfer', 'topup', 'atm')),
  ref_id TEXT UNIQUE DEFAULT ('HLU-TX-' || floor(random() * 900000 + 100000)::int),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. DOCUMENTS (Virtual Vault)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  doc_type TEXT NOT NULL, -- Property, Education, Contract, Legal
  file_url TEXT, -- Supabase Storage URL
  verified BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. BENEFICIARIES (Inheritance)
-- ============================================================
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  share_percent DECIMAL(5,2) DEFAULT 0,
  avatar_initials TEXT,
  color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. SMART CONTRACTS (Inheritance conditions)
-- ============================================================
CREATE TABLE IF NOT EXISTS smart_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  condition_text TEXT NOT NULL,
  action_text TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  biometric_sealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. POWER OF ATTORNEY (Diaspora)
-- ============================================================
CREATE TABLE IF NOT EXISTS power_of_attorneys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  attorney_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  expires_at DATE,
  biometric_sealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- transaction, security, bill, vault, system
  title TEXT NOT NULL,
  title_am TEXT,
  description TEXT,
  description_am TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — users can only access their own data
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_of_attorneys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies: users see only their own rows
CREATE POLICY "Users see own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own documents" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own beneficiaries" ON beneficiaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own smart_contracts" ON smart_contracts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own poas" ON power_of_attorneys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET for Vault documents
-- ============================================================
-- Run this separately in Supabase Dashboard → Storage → Create Bucket:
-- Bucket name: "vault-documents"
-- Public: false (private)

-- ============================================================
-- AUTO-CREATE PROFILE on signup trigger
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.email, '')
  );
  
  -- Create a default savings account
  INSERT INTO accounts (user_id, bank_name, account_type, account_number, balance, is_primary)
  VALUES (
    NEW.id,
    'Abyssinia Bank',
    'Savings',
    '****' || floor(random() * 9000 + 1000)::int,
    128450.75,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
