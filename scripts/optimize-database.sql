-- Database optimization script for Cosmodex
-- Run this script to improve query performance and reduce costs

-- User-related indexes for faster lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users (created_at);

-- Arena stats indexes for dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_arena_stats_user_id ON arena_stats (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_arena_stats_streak ON arena_stats (current_streak DESC);

-- Battle stats indexes for profile and dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_stats_user_id ON battle_user_stats (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_stats_elo ON battle_user_stats (elo_rating DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_stats_mcq_elo ON battle_user_stats (mcq_elo_rating DESC);

-- User badges indexes for achievements display
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_badges_user_id ON user_badges (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_badges_earned_at ON user_badges (earned_at DESC);

-- Enrollments indexes for course progress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_user_active ON enrollments (user_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_language ON enrollments (language_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments (enrolled_at DESC);

-- Module-related indexes for learning progress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modules_language_published ON modules (language_id, is_published);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_module_completions_user ON module_completions (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_module_completions_module ON module_completions (module_id);

-- Progress indexes for activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_user_correct ON progress (user_id, is_correct);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_completed_at ON progress (completed_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_question_id ON progress (question_id);

-- Battle matches indexes for recent match queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_matches_player1_status ON battle_matches (player1_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_matches_player2_status ON battle_matches (player2_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_matches_started_at ON battle_matches (started_at DESC);

-- MCQ battle matches indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_mcq_matches_player1_status ON battle_mcq_matches (player1_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_mcq_matches_player2_status ON battle_mcq_matches (player2_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_battle_mcq_matches_started_at ON battle_mcq_matches (started_at DESC);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_level_xp ON users (level DESC, xp_total DESC);

-- Language and course indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_languages_active ON languages (is_active) WHERE is_active = true;

-- Remove old unused indexes (if they exist and are confirmed unused)
-- Note: Only run these after confirming they're not used by other queries
-- DROP INDEX CONCURRENTLY IF EXISTS old_index_name;

-- Analyze tables to update query planner statistics
ANALYZE users;
ANALYZE arena_stats;
ANALYZE battle_user_stats;
ANALYZE user_badges;
ANALYZE enrollments;
ANALYZE modules;
ANALYZE module_completions;
ANALYZE progress;
ANALYZE battle_matches;
ANALYZE battle_mcq_matches;