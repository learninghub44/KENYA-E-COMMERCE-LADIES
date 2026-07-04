-- ============================================================
-- AI Support Assistant Schema
-- Migration: 202607040001_ai_support_assistant.sql
-- ============================================================

-- Enum for ticket status
CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'waiting_for_customer',
  'resolved',
  'closed'
);

-- Enum for ticket priority
CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Enum for user type
CREATE TYPE support_user_type AS ENUM (
  'buyer',
  'seller',
  'guest'
);

-- ============================================================
-- Knowledge Base Articles
-- ============================================================
CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX idx_knowledge_articles_slug ON knowledge_articles(slug);
CREATE INDEX idx_knowledge_articles_published ON knowledge_articles(is_published) WHERE is_published = true;

-- Full-text search index for knowledge base
ALTER TABLE knowledge_articles
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C')
  ) STORED;

CREATE INDEX idx_knowledge_articles_search ON knowledge_articles USING gin(search_vector);

-- ============================================================
-- Support Tickets
-- ============================================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_type support_user_type NOT NULL DEFAULT 'buyer',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general_question',
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT,
  seller_name TEXT,
  ai_summary TEXT,
  ai_suggested_category TEXT,
  ai_suggested_steps TEXT[],
  ai_confidence DECIMAL(3,2),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);

-- ============================================================
-- Ticket Messages (conversation thread)
-- ============================================================
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'support', 'ai', 'system')),
  message TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created ON ticket_messages(created_at);

-- ============================================================
-- AI Conversations (chat history)
-- ============================================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created ON ai_conversations(created_at);

-- ============================================================
-- Ticket Attachments (optional)
-- ============================================================
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ticket_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);

-- ============================================================
-- Updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_articles_updated_at
  BEFORE UPDATE ON knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security Policies
-- ============================================================

ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Knowledge articles: public read, admin write
CREATE POLICY "knowledge_articles_select_public" ON knowledge_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "knowledge_articles_admin_all" ON knowledge_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Support tickets: users see their own, admins see all
CREATE POLICY "support_tickets_select_own" ON support_tickets
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'support')
    )
  );

CREATE POLICY "support_tickets_insert_auth" ON support_tickets
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL
  );

CREATE POLICY "support_tickets_update_admin" ON support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'support')
    )
  );

-- Ticket messages: participants see thread, admins see all
CREATE POLICY "ticket_messages_select_participants" ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
        AND (t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'support')
          ))
    )
  );

CREATE POLICY "ticket_messages_insert_participants" ON ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
        AND (t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'support')
          ))
    )
  );

-- AI conversations: users see their own sessions
CREATE POLICY "ai_conversations_select_own" ON ai_conversations
  FOR SELECT USING (
    user_id = auth.uid()
    OR user_id IS NULL
  );

CREATE POLICY "ai_conversations_insert_any" ON ai_conversations
  FOR INSERT WITH CHECK (true);

-- Ticket attachments: follow ticket access rules
CREATE POLICY "ticket_attachments_select_participants" ON ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
        AND (t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'support')
          ))
    )
  );

CREATE POLICY "ticket_attachments_insert_participants" ON ticket_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
        AND (t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'support')
          ))
    )
  );
