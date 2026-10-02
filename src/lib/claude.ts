// Runtime capabilities of a published claude.ai artifact. Every call degrades to null.
declare global { interface Window { claude?: { use: (name: string) => Promise<any> } } }
export async function cap(name: string): Promise<any | null> {
  try { return window.claude?.use ? await window.claude.use(name) : null; } catch { return null; }
}
