-- Seed missing content sections only (safe)
-- This creates missing rows with empty texts/images, preserving existing content.
-- If your table uses id instead of section_id, replace section_id with id before running.

INSERT IGNORE INTO content_sections (section_id, section_name, texts, images) VALUES
('hero', 'hero', '{}', '{}'),
('context', 'context', '{}', '{}'),
('video', 'video', '{}', '{}'),
('audience', 'audience', '{}', '{}'),
('manual-strategic', 'manual-strategic', '{}', '{}'),
('testimonials', 'testimonials', '{}', '{}'),
('story-bridge', 'story-bridge', '{}', '{}'),
('seller-code', 'seller-code', '{}', '{}'),
('pricing', 'pricing', '{}', '{}'),
('buyer-wave', 'buyer-wave', '{}', '{}'),
('authority', 'authority', '{}', '{}'),
('lead-magnet', 'lead-magnet', '{}', '{}'),
('newsletter', 'newsletter', '{}', '{}'),
('faq', 'faq', '{}', '{}'),
('contact', 'contact', '{}', '{}'),
('privacy-policy', 'privacy-policy', '{}', '{}'),
('terms-of-use', 'terms-of-use', '{}', '{}'),
('antipiracy', 'antipiracy', '{}', '{}');
