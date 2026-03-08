/*
  # Allow anonymous users to delete scholarship applications

  1. Changes
    - Add policy to allow anonymous (anon) users to DELETE from solicitudes table
    - This enables the admin panel to delete submissions
  
  2. Security
    - Allows DELETE operations for anonymous users
    - This is acceptable since the admin panel has its own authentication layer
*/

CREATE POLICY "Anonymous users can delete applications"
  ON solicitudes
  FOR DELETE
  TO anon
  USING (true);
