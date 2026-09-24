-- ShareTemp ID formats
-- File: ST + letter + 2 digits (STa23)
-- Folder: SHR + letter + 2 digits (SHRa23)
-- Legacy CO* / COD* still accepted for lookups and delete_batch

CREATE OR REPLACE FUNCTION public.delete_batch(p_batch_code text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  n int := 0;
  v_batch text;
BEGIN
  IF p_batch_code IS NULL THEN
    RETURN 0;
  END IF;

  -- New folder format SHR*
  IF p_batch_code ~* '^SHR[a-zA-Z][0-9]{2}$' THEN
    v_batch := 'SHR' || lower(substr(p_batch_code, 4, 1)) || substr(p_batch_code, 5, 2);
  -- Legacy COD*
  ELSIF p_batch_code ~* '^COD[a-zA-Z][0-9]{2}$' THEN
    v_batch := 'COD' || lower(substr(p_batch_code, 4, 1)) || substr(p_batch_code, 5, 2);
  ELSE
    RETURN 0;
  END IF;

  FOR r IN SELECT code FROM public.shared_drops WHERE batch_code = v_batch LOOP
    IF public.delete_drop(r.code) THEN
      n := n + 1;
    END IF;
  END LOOP;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_batch(text) TO anon, authenticated, service_role;

DROP FUNCTION IF EXISTS public.create_drop(text, text, text, text, text, bigint, text, text, text, int);
DROP FUNCTION IF EXISTS public.create_drop(text, text, text, text, text, bigint, text, text, text, int, text);

CREATE OR REPLACE FUNCTION public.create_drop(
  p_type text,
  p_content text DEFAULT NULL,
  p_storage_path text DEFAULT NULL,
  p_original_filename text DEFAULT NULL,
  p_mime_type text DEFAULT NULL,
  p_file_size bigint DEFAULT NULL,
  p_title text DEFAULT NULL,
  p_password_hash text DEFAULT NULL,
  p_batch_code text DEFAULT NULL,
  p_ttl_hours int DEFAULT 24,
  p_owner_key text DEFAULT NULL
)
RETURNS TABLE (code text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_letters text := 'abcdefghijklmnopqrstuvwxyz';
  v_attempt int := 0;
  v_hours int := COALESCE(NULLIF(p_ttl_hours, 0), 24);
  v_expires timestamptz;
  v_meta jsonb := '{}'::jsonb;
  v_batch text := NULL;
BEGIN
  IF v_hours NOT IN (1, 6, 24) THEN v_hours := 24; END IF;
  v_expires := now() + make_interval(hours => v_hours);

  IF p_type NOT IN ('text','image','video') THEN RAISE EXCEPTION 'invalid_type'; END IF;
  IF p_title IS NULL OR length(btrim(p_title)) = 0 THEN RAISE EXCEPTION 'missing_title'; END IF;

  IF p_type = 'text' THEN
    IF p_content IS NULL OR length(btrim(p_content)) = 0 THEN RAISE EXCEPTION 'empty_content'; END IF;
    IF length(p_content) > 2000000 THEN RAISE EXCEPTION 'content_too_large'; END IF;
  ELSE
    IF p_storage_path IS NULL OR length(btrim(p_storage_path)) = 0 THEN RAISE EXCEPTION 'missing_file'; END IF;
  END IF;

  v_meta := jsonb_build_object('title', left(btrim(p_title), 120));
  IF p_password_hash IS NOT NULL AND length(btrim(p_password_hash)) > 0 THEN
    v_meta := v_meta || jsonb_build_object('password_hash', btrim(p_password_hash));
  END IF;
  IF p_owner_key IS NOT NULL AND length(btrim(p_owner_key)) >= 16 THEN
    v_meta := v_meta || jsonb_build_object('owner_key', left(btrim(p_owner_key), 64));
  END IF;

  -- Normalize batch: SHR* (new) or COD* (legacy session still in flight)
  IF p_batch_code IS NOT NULL AND p_batch_code ~* '^SHR[a-zA-Z][0-9]{2}$' THEN
    v_batch := 'SHR' || lower(substr(p_batch_code, 4, 1)) || substr(p_batch_code, 5, 2);
  ELSIF p_batch_code IS NOT NULL AND p_batch_code ~* '^COD[a-zA-Z][0-9]{2}$' THEN
    v_batch := 'COD' || lower(substr(p_batch_code, 4, 1)) || substr(p_batch_code, 5, 2);
  END IF;

  DELETE FROM public.shared_drops WHERE public.shared_drops.expires_at <= now();

  LOOP
    v_attempt := v_attempt + 1;
    -- New file ID: ST + letter + 2 digits
    v_code := 'ST'
      || substr(v_letters, 1 + floor(random() * 26)::int, 1)
      || lpad(floor(random() * 100)::int::text, 2, '0');

    BEGIN
      INSERT INTO public.shared_drops (
        code, type, content, storage_path, original_filename, mime_type, file_size,
        expires_at, metadata, batch_code
      ) VALUES (
        v_code,
        p_type,
        CASE WHEN p_type = 'text' THEN p_content ELSE NULL END,
        p_storage_path,
        p_original_filename,
        p_mime_type,
        p_file_size,
        v_expires,
        v_meta,
        v_batch
      );
      code := v_code;
      expires_at := v_expires;
      RETURN NEXT;
      RETURN;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempt >= 60 THEN RAISE EXCEPTION 'no_code_available'; END IF;
    END;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_drop(text, text, text, text, text, bigint, text, text, text, int, text)
TO anon, authenticated, service_role;
