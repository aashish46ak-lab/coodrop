-- Server delete, storage path cleanup helper, owner history

-- Delete a single drop by code (knowing the code = permission)
CREATE OR REPLACE FUNCTION public.delete_drop(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_path text;
BEGIN
  IF p_code IS NULL OR length(btrim(p_code)) < 4 THEN
    RETURN false;
  END IF;

  SELECT storage_path INTO v_path
  FROM public.shared_drops
  WHERE code = p_code OR lower(code) = lower(p_code);

  DELETE FROM public.shared_drops
  WHERE code = p_code OR lower(code) = lower(p_code);

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Best-effort storage remove (may fail if no permission; ok)
  IF v_path IS NOT NULL THEN
    BEGIN
      PERFORM storage.delete_object('drops', v_path);
    EXCEPTION WHEN OTHERS THEN
      NULL; -- ignore storage errors
    END;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_drop(text) TO anon, authenticated, service_role;

-- Delete all drops in a batch
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
  IF p_batch_code IS NULL OR p_batch_code !~* '^COD[a-zA-Z][0-9]{2}$' THEN
    RETURN 0;
  END IF;
  v_batch := 'COD' || lower(substr(p_batch_code, 4, 1)) || substr(p_batch_code, 5, 2);

  FOR r IN SELECT code FROM public.shared_drops WHERE batch_code = v_batch LOOP
    IF public.delete_drop(r.code) THEN
      n := n + 1;
    END IF;
  END LOOP;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_batch(text) TO anon, authenticated, service_role;

-- Cleanup expired DB rows (call via cron or manually)
CREATE OR REPLACE FUNCTION public.cleanup_expired_drops()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  n int := 0;
BEGIN
  FOR r IN
    SELECT code, storage_path FROM public.shared_drops WHERE expires_at <= now()
  LOOP
    IF r.storage_path IS NOT NULL THEN
      BEGIN
        PERFORM storage.delete_object('drops', r.storage_path);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
    DELETE FROM public.shared_drops WHERE code = r.code;
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_drops() TO anon, authenticated, service_role;

-- List drops for an owner_key (cross-device history)
CREATE OR REPLACE FUNCTION public.list_owner_drops(p_owner_key text)
RETURNS TABLE (
  code text,
  type text,
  title text,
  expires_at timestamptz,
  created_at timestamptz,
  batch_code text,
  has_password boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_owner_key IS NULL OR length(btrim(p_owner_key)) < 16 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    d.code,
    d.type,
    COALESCE(d.metadata->>'title', d.code),
    d.expires_at,
    d.created_at,
    d.batch_code,
    (d.metadata ? 'password_hash')
  FROM public.shared_drops d
  WHERE d.metadata->>'owner_key' = btrim(p_owner_key)
    AND d.status = 'active'
    AND d.expires_at > now()
  ORDER BY d.created_at DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_owner_drops(text) TO anon, authenticated, service_role;

-- Extend create_drop with owner_key (replace function)
DROP FUNCTION IF EXISTS public.create_drop(text, text, text, text, text, bigint, text, text, text, int);

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

  DELETE FROM public.shared_drops WHERE public.shared_drops.expires_at <= now();

  LOOP
    v_attempt := v_attempt + 1;
    v_code := 'CO'
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
        CASE
          WHEN p_batch_code IS NOT NULL AND p_batch_code ~* '^COD[a-z][0-9]{2}$'
          THEN upper(substr(p_batch_code, 1, 3)) || lower(substr(p_batch_code, 4, 1)) || substr(p_batch_code, 5, 2)
          ELSE NULL
        END
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
