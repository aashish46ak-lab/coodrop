-- Accept SHR* folder codes in list_batch_drops (was COD-only)

CREATE OR REPLACE FUNCTION public.list_batch_drops(p_batch_code text)
RETURNS TABLE (
  code text,
  type text,
  title text,
  expires_at timestamptz,
  created_at timestamptz,
  has_password boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch text;
BEGIN
  IF p_batch_code IS NULL THEN
    RETURN;
  END IF;

  IF p_batch_code ~* '^SHR[a-zA-Z][0-9]{2}$' THEN
    v_batch := 'SHR' || lower(substr(p_batch_code, 4, 1)) || substr(p_batch_code, 5, 2);
  ELSIF p_batch_code ~* '^COD[a-zA-Z][0-9]{2}$' THEN
    v_batch := 'COD' || lower(substr(p_batch_code, 4, 1)) || substr(p_batch_code, 5, 2);
  ELSE
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    d.code,
    d.type,
    COALESCE(d.metadata->>'title', d.code),
    d.expires_at,
    d.created_at,
    (d.metadata ? 'password_hash')
  FROM public.shared_drops d
  WHERE d.batch_code = v_batch
    AND d.status = 'active'
    AND d.expires_at > now()
  ORDER BY d.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_batch_drops(text) TO anon, authenticated, service_role;
