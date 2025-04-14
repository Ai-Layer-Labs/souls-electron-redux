CREATE TABLE `knowledge_bases` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
); 