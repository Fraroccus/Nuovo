-- Initial migration: create a simple table to confirm migrations run
CREATE TABLE IF NOT EXISTS example (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
