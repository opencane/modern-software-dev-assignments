/*
  # Create Leaderboard Table

  1. New Tables
    - `leaderboard`
      - `id` (uuid, primary key)
      - `name` (text, player name)
      - `score` (integer, game score)
      - `time` (integer, time taken in seconds)
      - `created_at` (timestamptz, when score was submitted)
  
  2. Security
    - Enable RLS on `leaderboard` table
    - Add policy for anyone to read leaderboard (public data)
    - Add policy for anyone to insert scores (public game)
  
  3. Performance
    - Add index on score for efficient leaderboard queries
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  time integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scores"
  ON leaderboard FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);