-- Migration: Make required form fields NOT NULL in database
-- This ensures database schema matches form validation requirements
--
-- IMPORTANT: Review and fix any existing NULL values BEFORE running this migration!
-- These fields are required in the form, so NULL values indicate incomplete/invalid data.

-- Step 1: Check for NULL values and empty arrays in required fields
-- Run these queries first to see what needs to be fixed:
-- SELECT COUNT(*) FROM women WHERE email IS NULL;
-- SELECT COUNT(*) FROM women WHERE job_title IS NULL;
-- SELECT COUNT(*) FROM women WHERE nationality IS NULL;
-- SELECT COUNT(*) FROM women WHERE short_bio IS NULL;
-- SELECT COUNT(*) FROM women WHERE languages IS NULL;
-- SELECT COUNT(*) FROM women WHERE areas_of_expertise IS NULL;
-- SELECT COUNT(*) FROM women WHERE interested_in IS NULL;
-- Check for empty arrays (array_length returns NULL for empty arrays, cardinality returns 0)
-- SELECT COUNT(*) FROM women WHERE cardinality(languages) = 0;
-- SELECT COUNT(*) FROM women WHERE cardinality(areas_of_expertise) = 0;
-- SELECT COUNT(*) FROM women WHERE cardinality(interested_in) = 0;

-- Step 2: Standardize on NULL (not empty strings) for optional fields
-- Convert empty strings to NULL for optional fields (database convention)
-- NULL = "not provided", empty string = "explicitly set to empty"
UPDATE women SET company_name = NULL WHERE company_name = '';
UPDATE women SET long_bio = NULL WHERE long_bio = '';
UPDATE women SET contact_number = NULL WHERE contact_number = '';
UPDATE women SET alt_contact_name = NULL WHERE alt_contact_name = '';
UPDATE women SET profile_picture_url = NULL WHERE profile_picture_url = '';
UPDATE women SET keywords = NULL WHERE keywords = ARRAY[]::text[] OR keywords = '{}';

-- Step 2b: Fix NULL values and empty arrays in REQUIRED fields before adding constraints
-- Option A: Delete incomplete records (if they're test data)
-- DELETE FROM women WHERE email IS NULL OR job_title IS NULL OR nationality IS NULL 
--   OR short_bio IS NULL OR languages IS NULL OR areas_of_expertise IS NULL OR interested_in IS NULL
--   OR cardinality(languages) = 0
--   OR cardinality(areas_of_expertise) = 0
--   OR cardinality(interested_in) = 0;

-- Option B: Fix NULL arrays (convert to empty arrays temporarily, but they'll fail the empty array check)
-- NOTE: Empty arrays are NOT acceptable for required fields - they must have at least one item
-- If you have empty arrays, you MUST either:
--   1. Delete the incomplete records, OR
--   2. Manually add at least one item to each array
UPDATE women SET languages = ARRAY[]::text[] WHERE languages IS NULL;
UPDATE women SET areas_of_expertise = ARRAY[]::text[] WHERE areas_of_expertise IS NULL;
UPDATE women SET interested_in = ARRAY[]::text[] WHERE interested_in IS NULL;

-- Step 2c: Fix existing empty arrays in REQUIRED fields
-- These should not exist if validation is working correctly, but we need to handle them
-- Note: PostgreSQL's array_length() returns NULL for empty arrays (not 0), so we use cardinality() instead
-- cardinality() returns 0 for empty arrays, making the check simpler
-- Option A: Delete records with empty arrays (recommended - they're invalid)
-- DELETE FROM women 
--   WHERE cardinality(languages) = 0
--   OR cardinality(areas_of_expertise) = 0
--   OR cardinality(interested_in) = 0;

-- Option B: Manually fix empty arrays by adding placeholder values (NOT recommended - use real data)
-- UPDATE women SET languages = ARRAY['Language to be updated'] WHERE cardinality(languages) = 0;
-- UPDATE women SET areas_of_expertise = ARRAY['Expertise to be updated'] WHERE cardinality(areas_of_expertise) = 0;
-- UPDATE women SET interested_in = ARRAY['speaker'] WHERE cardinality(interested_in) = 0;

-- Option C: For string fields, you MUST provide real values or delete the records
-- These cannot be NULL, so you need to either:
--   1. Delete incomplete records, OR
--   2. Manually update them with real values
-- Example: UPDATE women SET email = 'fixed@example.com' WHERE email IS NULL;

-- Step 3: Add NOT NULL constraints to required fields
ALTER TABLE women
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN job_title SET NOT NULL,
  ALTER COLUMN nationality SET NOT NULL,
  ALTER COLUMN short_bio SET NOT NULL,
  ALTER COLUMN languages SET NOT NULL,
  ALTER COLUMN areas_of_expertise SET NOT NULL,
  ALTER COLUMN interested_in SET NOT NULL;

-- Step 4: Add check constraints to ensure arrays are not empty
-- This enforces the "at least one" requirement from the form validation at the database level
-- Provides defense in depth - even if frontend validation is bypassed, database will reject empty arrays
-- IMPORTANT: Make sure you've fixed all existing empty arrays before running this step!
--
-- Note: array_length() returns NULL for empty arrays (not 0), so we use cardinality() instead
-- cardinality() returns 0 for empty arrays, which makes the check simpler
ALTER TABLE women
  ADD CONSTRAINT languages_not_empty CHECK (cardinality(languages) > 0),
  ADD CONSTRAINT areas_of_expertise_not_empty CHECK (cardinality(areas_of_expertise) > 0),
  ADD CONSTRAINT interested_in_not_empty CHECK (cardinality(interested_in) > 0);

