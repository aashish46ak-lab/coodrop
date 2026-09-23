-- Optional title support for create_drop (stores in metadata.title)
-- Run this in Supabase SQL Editor after the base migration.

CREATE OR REPLACE FUNCTION public.create_drop(
  p_type text,
  p_content text DEFAULT NULL,
  p_storage_path text DEFAULT NULL,
  p_original_filename text DEFAULT NULL,
  p_mime_type text DEFAULT NULL,
  p_file_size bigint DEFAULT NULL,
  p_title text DEFAULT NULL
)
RETURNS TABLE (code text, expires_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_letters text := 'abcdefghijklmnopqrstuvwxyz';
  v_attempt int := 0;
  v_expires timestamp with time zone := now() + interval '24 hours';
  v_meta jsonb := '{}'::jsonb;
BEGIN
  IF p_type NOT IN ('text','image','video') THEN
    RAISE EXCEPTION 'invalid_type';
  END IF;

  IF p_type = 'text' THEN
    IF p_content IS NULL OR length(btrim(p_content)) = 0 THEN
      RAISE EXCEPTION 'empty_content';
    END IF;
    IF length(p_content) > 2000000 THEN
      RAISE EXCEPTION 'content_too_large';
    END IF;
  ELSE
    IF p_storage_path IS NULL OR length(btrim(p_storage_path)) = 0 THEN
      RAISE EXCEPTION 'missing_file';
    END IF;
  END IF;

  IF p_title IS NOT NULL AND length(btrim(p_title)) > 0 THEN
    v_meta := jsonb_build_object('title', left(btrim(p_title), 120));
  END IF;

  DELETE FROM public.shared_drops WHERE expires_at <= now();

  LOOP
    v_attempt := v_attempt + 1;
    v_code := 'CO'
      || substr(v_letters, 1 + floor(random() * 26)::int, 1)
      || lpad(floor(random() * 100)::int::text, 2, '0');

    BEGIN
      INSERT INTO public.shared_drops (
        code, type, content, storage_path, original_filename, mime_type, file_size, expires_at, metadata
      ) VALUES (
        v_code,
        p_type,
        CASE WHEN p_type = 'text' THEN p_content ELSE NULL END,
        p_storage_path,
        p_original_filename,
        p_mime_type,
        p_file_size,
        v_expires,
        v_meta
      );
      RETURN QUERY SELECT v_code, v_expires;
      RETURN;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempt >= 60 THEN
        RAISE EXCEPTION 'no_code_available';
      END IF;
    END;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_drop(text, text, text, text, text, bigint, text)
TO anon, authenticated, service_role;
