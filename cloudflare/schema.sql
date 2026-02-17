-- TierJobs D1 Schema
-- Clean, indexed, ready for 10k+ jobs

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  careers_url TEXT,
  tier TEXT NOT NULL,
  tier_score INTEGER NOT NULL,
  job_count INTEGER DEFAULT 0,
  last_scraped INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_companies_tier ON companies(tier);
CREATE INDEX IF NOT EXISTS idx_companies_tier_score ON companies(tier_score DESC);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT UNIQUE NOT NULL,
  company_slug TEXT NOT NULL,
  company_name TEXT NOT NULL,
  tier TEXT NOT NULL,
  tier_score INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  location TEXT,
  remote BOOLEAN DEFAULT FALSE,
  level TEXT NOT NULL,
  job_type TEXT NOT NULL,
  team TEXT,
  description TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  posted_at INTEGER,
  scraped_at INTEGER NOT NULL,
  score INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (company_slug) REFERENCES companies(slug)
);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_slug);
CREATE INDEX IF NOT EXISTS idx_jobs_tier ON jobs(tier);
CREATE INDEX IF NOT EXISTS idx_jobs_tier_score ON jobs(tier_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_level ON jobs(level);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_scraped ON jobs(scraped_at DESC);

-- Full-text search for job titles
CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5(
  title,
  description,
  company_name,
  content='jobs',
  content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS jobs_ai AFTER INSERT ON jobs BEGIN
  INSERT INTO jobs_fts(rowid, title, description, company_name)
  VALUES (NEW.id, NEW.title, NEW.description, NEW.company_name);
END;

CREATE TRIGGER IF NOT EXISTS jobs_ad AFTER DELETE ON jobs BEGIN
  INSERT INTO jobs_fts(jobs_fts, rowid, title, description, company_name)
  VALUES ('delete', OLD.id, OLD.title, OLD.description, OLD.company_name);
END;

CREATE TRIGGER IF NOT EXISTS jobs_au AFTER UPDATE ON jobs BEGIN
  INSERT INTO jobs_fts(jobs_fts, rowid, title, description, company_name)
  VALUES ('delete', OLD.id, OLD.title, OLD.description, OLD.company_name);
  INSERT INTO jobs_fts(rowid, title, description, company_name)
  VALUES (NEW.id, NEW.title, NEW.description, NEW.company_name);
END;

-- User sessions (for saved jobs, preferences)
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  saved_jobs TEXT DEFAULT '[]', -- JSON array of job IDs
  preferences TEXT DEFAULT '{}', -- JSON object
  search_history TEXT DEFAULT '[]', -- JSON array of searches
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Chat history for AI interactions
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  metadata TEXT, -- JSON for job results, etc.
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (session_id) REFERENCES user_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id, created_at);
