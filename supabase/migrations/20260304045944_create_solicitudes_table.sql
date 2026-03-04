/*
  # Create solicitudes (scholarship applications) table

  ## Overview
  This migration creates the main table for storing scholarship application submissions from the beca form.

  ## New Tables
    - `solicitudes`
      - `id` (uuid, primary key) - Unique identifier for each application
      - `timestamp` (timestamptz, not null) - Submission timestamp
      - `cicloEscolar` (text) - School year/enrollment date
      - `tipoApoyo` (text) - Type of scholarship support requested
      - `refrendo` (text) - Renewal status (Refrendo/Primera vez)
      - `porcentajeBeca` (text) - Current scholarship percentage
      
      ### Student Information
      - `alumnoApellidoPaterno` (text) - Student's paternal last name
      - `alumnoApellidoMaterno` (text) - Student's maternal last name
      - `alumnoNombres` (text) - Student's first name(s)
      - `alumnoFechaNacimiento` (text) - Student's birth date
      - `alumnoCURP` (text) - Student's CURP
      - `alumnoDomicilio` (text) - Student's address
      - `alumnoCiudad` (text) - Student's city
      - `alumnoEstado` (text) - Student's state
      - `alumnoCP` (text) - Student's postal code
      - `alumnoNivelEducativo` (text) - Student's education level
      - `alumnoGrado` (text) - Student's grade

      ### Father/Guardian Information
      - `padreApellidoPaterno` (text) - Father's paternal last name
      - `padreApellidoMaterno` (text) - Father's maternal last name
      - `padreNombres` (text) - Father's first name(s)
      - `padreFechaNacimiento` (text) - Father's birth date
      - `padreViveConAlumno` (text) - Lives with student (Sí/No)
      - `padreDomicilio` (text) - Father's address
      - `padreTelefono` (text) - Father's phone
      - `padreCorreo` (text) - Father's email
      - `padrePuesto` (text) - Father's job position
      - `padreLugarTrabajo` (text) - Father's workplace
      - `padreDomicilioTrabajo` (text) - Father's work address
      - `padreIngresoMensual` (text) - Father's monthly income
      - `padreIngresosAdicionales` (text) - Father's additional income
      - `padreIngresosPensiones` (text) - Father's pension/support income
      - `padreIngresosExtras` (text) - Father's extra family income

      ### Mother/Guardian Information
      - `madreApellidoPaterno` (text) - Mother's paternal last name
      - `madreApellidoMaterno` (text) - Mother's maternal last name
      - `madreNombres` (text) - Mother's first name(s)
      - `madreFechaNacimiento` (text) - Mother's birth date
      - `madreViveConAlumno` (text) - Lives with student (Sí/No)
      - `madreDomicilio` (text) - Mother's address
      - `madreTelefono` (text) - Mother's phone
      - `madreCorreo` (text) - Mother's email
      - `madrePuesto` (text) - Mother's job position
      - `madreLugarTrabajo` (text) - Mother's workplace
      - `madreDomicilioTrabajo` (text) - Mother's work address
      - `madreIngresoMensual` (text) - Mother's monthly income
      - `madreIngresosAdicionales` (text) - Mother's additional income
      - `madreIngresosPensiones` (text) - Mother's pension/support income
      - `madreIngresosExtras` (text) - Mother's extra family income

      ### Family Information
      - `estadoCivil` (text) - Parents' marital status
      - `numIntegrantes` (text) - Number of family members
      - `miembros` (jsonb) - Family members details (JSON array)
      - `numMiembrosRecomendacion` (text) - Number of recommended members
      - `miembrosRecomendacion` (jsonb) - Recommendation members details (JSON array)
      - `becaRecomendacionActiva` (boolean) - Recommendation scholarship active

      ### Monthly Expenses
      - `alimentacion` (text) - Food expenses
      - `rentaHipoteca` (text) - Rent/mortgage
      - `servicios` (text) - Utilities
      - `transporte` (text) - Transportation
      - `educacion` (text) - Education
      - `salud` (text) - Health
      - `deudasCreditos` (text) - Debts/credits
      - `recreacion` (text) - Recreation
      - `totalIngresosFamiliares` (text) - Total family income

      ### Housing & Consent
      - `tipoVivienda` (text) - Type of housing
      - `propiedadesAdicionales` (text) - Additional properties
      - `conformidad` (boolean) - Privacy policy consent
      - `consentimientoNombre` (text) - Consent document filename

  ## Security
    - Enable RLS on `solicitudes` table
    - Add policy for anonymous users to insert applications (public form)
    - Add policy for authenticated users to view all applications (admin access)
    - Add policy for authenticated users to delete applications (admin access)

  ## Important Notes
    1. The form is public, so anonymous users can submit applications
    2. Only authenticated administrators can view and manage submissions
    3. All monetary fields are stored as text to preserve formatting
    4. Family members are stored as JSONB for flexible structure
*/

CREATE TABLE IF NOT EXISTS solicitudes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  cicloEscolar text DEFAULT '',
  tipoApoyo text DEFAULT '',
  refrendo text DEFAULT '',
  porcentajeBeca text DEFAULT '',
  
  alumnoApellidoPaterno text DEFAULT '',
  alumnoApellidoMaterno text DEFAULT '',
  alumnoNombres text DEFAULT '',
  alumnoFechaNacimiento text DEFAULT '',
  alumnoCURP text DEFAULT '',
  alumnoDomicilio text DEFAULT '',
  alumnoCiudad text DEFAULT '',
  alumnoEstado text DEFAULT '',
  alumnoCP text DEFAULT '',
  alumnoNivelEducativo text DEFAULT '',
  alumnoGrado text DEFAULT '',
  
  padreApellidoPaterno text DEFAULT '',
  padreApellidoMaterno text DEFAULT '',
  padreNombres text DEFAULT '',
  padreFechaNacimiento text DEFAULT '',
  padreViveConAlumno text DEFAULT '',
  padreDomicilio text DEFAULT '',
  padreTelefono text DEFAULT '',
  padreCorreo text DEFAULT '',
  padrePuesto text DEFAULT '',
  padreLugarTrabajo text DEFAULT '',
  padreDomicilioTrabajo text DEFAULT '',
  padreIngresoMensual text DEFAULT '',
  padreIngresosAdicionales text DEFAULT '',
  padreIngresosPensiones text DEFAULT '',
  padreIngresosExtras text DEFAULT '',
  
  madreApellidoPaterno text DEFAULT '',
  madreApellidoMaterno text DEFAULT '',
  madreNombres text DEFAULT '',
  madreFechaNacimiento text DEFAULT '',
  madreViveConAlumno text DEFAULT '',
  madreDomicilio text DEFAULT '',
  madreTelefono text DEFAULT '',
  madreCorreo text DEFAULT '',
  madrePuesto text DEFAULT '',
  madreLugarTrabajo text DEFAULT '',
  madreDomicilioTrabajo text DEFAULT '',
  madreIngresoMensual text DEFAULT '',
  madreIngresosAdicionales text DEFAULT '',
  madreIngresosPensiones text DEFAULT '',
  madreIngresosExtras text DEFAULT '',
  
  estadoCivil text DEFAULT '',
  numIntegrantes text DEFAULT '',
  miembros jsonb DEFAULT '[]'::jsonb,
  numMiembrosRecomendacion text DEFAULT '',
  miembrosRecomendacion jsonb DEFAULT '[]'::jsonb,
  becaRecomendacionActiva boolean DEFAULT false,
  
  alimentacion text DEFAULT '',
  rentaHipoteca text DEFAULT '',
  servicios text DEFAULT '',
  transporte text DEFAULT '',
  educacion text DEFAULT '',
  salud text DEFAULT '',
  deudasCreditos text DEFAULT '',
  recreacion text DEFAULT '',
  totalIngresosFamiliares text DEFAULT '',
  
  tipoVivienda text DEFAULT '',
  propiedadesAdicionales text DEFAULT '',
  conformidad boolean DEFAULT false,
  consentimientoNombre text DEFAULT ''
);

ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scholarship applications"
  ON solicitudes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all applications"
  ON solicitudes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete applications"
  ON solicitudes
  FOR DELETE
  TO authenticated
  USING (true);
