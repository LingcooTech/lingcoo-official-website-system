UPDATE "presentation_profiles"
SET "public_url" = 'https://www.lingcoo.com', "updated_at" = now()
WHERE "id" = 'default' AND "public_url" = 'https://lingcoo.com';
