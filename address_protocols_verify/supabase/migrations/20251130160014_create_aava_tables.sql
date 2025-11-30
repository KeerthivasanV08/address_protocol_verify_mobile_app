/*
  # AAVA AIA Mobile Database Schema

  ## Overview
  Creates the database schema for the AAVA (Address Validation Protocol) AIA mobile application.
  This migration sets up tables for user profiles, consent management, validation history, and audit logs.

  ## New Tables
  
  ### 1. `user_profiles`
  Stores user profile information for the mobile app
  - `id` (uuid, primary key) - User identifier
  - `user_id` (text, unique) - External user ID from the app
  - `display_name` (text) - User's display name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `preferences` (jsonb) - User preferences and settings

  ### 2. `consents`
  Tracks user consent for address validation operations
  - `id` (uuid, primary key) - Consent record identifier
  - `consent_id` (text, unique) - External consent ID from backend
  - `user_id` (text) - Reference to user
  - `action` (text) - Type of action consented to
  - `status` (text) - granted, pending, or revoked
  - `granted_at` (timestamptz) - When consent was granted
  - `expires_at` (timestamptz) - When consent expires
  - `revoked_at` (timestamptz) - When consent was revoked
  - `metadata` (jsonb) - Additional consent metadata

  ### 3. `validation_history`
  Stores validation requests and results
  - `id` (uuid, primary key) - Record identifier
  - `request_id` (text, unique) - External request ID from backend
  - `user_id` (text) - Reference to user
  - `consent_id` (text) - Reference to consent used
  - `address_parts` (jsonb) - Submitted address components
  - `latitude` (numeric) - Submitted latitude
  - `longitude` (numeric) - Submitted longitude
  - `digipin` (text) - Generated or validated DIGIPIN
  - `is_valid` (boolean) - Validation result
  - `confidence_score` (numeric) - Confidence score (0-1)
  - `normalized_address` (text) - Normalized address from validation
  - `validation_checks` (jsonb) - Detailed validation check results
  - `created_at` (timestamptz) - When validation was performed
  - `processing_time_ms` (integer) - Processing time in milliseconds

  ### 4. `audit_logs`
  Audit trail for all operations
  - `id` (uuid, primary key) - Log entry identifier
  - `user_id` (text) - User who performed the action
  - `action` (text) - Action type (generate_digipin, validate_address, etc.)
  - `request_id` (text) - Related request ID if applicable
  - `digipin` (text) - DIGIPIN involved if applicable
  - `coordinates` (jsonb) - Coordinates involved
  - `result` (jsonb) - Operation result data
  - `ip_address` (text) - IP address (for web version)
  - `created_at` (timestamptz) - When action occurred
  - `metadata` (jsonb) - Additional metadata

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies enforce user isolation
  
  ## Indexes
  - Index on user_id columns for faster lookups
  - Index on created_at for chronological queries
  - Index on request_id for status lookups
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{}'::jsonb
);

-- Create consents table
CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id text UNIQUE NOT NULL,
  user_id text NOT NULL,
  action text NOT NULL DEFAULT 'address_validation',
  status text NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'pending', 'revoked')),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create validation_history table
CREATE TABLE IF NOT EXISTS validation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text UNIQUE NOT NULL,
  user_id text NOT NULL,
  consent_id text,
  address_parts jsonb DEFAULT '{}'::jsonb,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  digipin text NOT NULL,
  is_valid boolean DEFAULT false,
  confidence_score numeric DEFAULT 0,
  normalized_address text,
  validation_checks jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  processing_time_ms integer DEFAULT 0
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  action text NOT NULL,
  request_id text,
  digipin text,
  coordinates jsonb,
  result jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_user_id ON consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_consent_id ON consents(consent_id);
CREATE INDEX IF NOT EXISTS idx_validation_history_user_id ON validation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_validation_history_request_id ON validation_history(request_id);
CREATE INDEX IF NOT EXISTS idx_validation_history_created_at ON validation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));

-- RLS Policies for consents
CREATE POLICY "Users can view own consents"
  ON consents FOR SELECT
  TO authenticated
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert own consents"
  ON consents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update own consents"
  ON consents FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));

-- RLS Policies for validation_history
CREATE POLICY "Users can view own validation history"
  ON validation_history FOR SELECT
  TO authenticated
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert own validation records"
  ON validation_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('app.user_id', true));

-- RLS Policies for audit_logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert own audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('app.user_id', true));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
