-- Migration: Change credits column from INTEGER to NUMERIC to support 0.5 credits
-- Run this in your Supabase SQL Editor

ALTER TABLE courses 
ALTER COLUMN credits TYPE NUMERIC(3,1) USING credits::NUMERIC(3,1);

