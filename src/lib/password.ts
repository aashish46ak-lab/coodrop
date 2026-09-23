/** Simple SHA-256 hash for optional drop passwords (temporary shares). */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password.trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return true;
  const h = await hashPassword(password);
  return h === hash;
}
