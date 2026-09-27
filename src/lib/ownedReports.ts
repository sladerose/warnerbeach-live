const STORAGE_KEY = "wbl_owned_reports";

function readAll(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOwnedReport(reportId: string, resolveToken: string) {
  try {
    const all = readAll();
    all[reportId] = resolveToken;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage unavailable (private mode, etc.) — resolve button just won't show
  }
}

export function getOwnedReportToken(reportId: string): string | null {
  return readAll()[reportId] ?? null;
}
