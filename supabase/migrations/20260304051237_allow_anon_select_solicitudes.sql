/*
  # Allow anonymous users to view scholarship applications

  1. Changes
    - Add policy to allow anonymous (anon) users to SELECT from solicitudes table
    - This enables the admin panel to view submissions without Supabase authentication
  
  2. Security
    - Only allows SELECT operations for anonymous users
    - INSERT, UPDATE, and DELETE remain protected
*/

CREATE POLICY "Anonymous users can view applications"
  ON solicitudes
  FOR SELECT
  TO anon
  USING (true);
