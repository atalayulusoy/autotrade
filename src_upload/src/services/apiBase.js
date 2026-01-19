const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const normalizeBase = (base) => {
  if (!base) return "";
  return String(base).replace(/\/+$/, "");
};

export const apiUrl = (path) => {
  const base = normalizeBase(RAW_API_BASE);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalizedPath;
  return `${base}${normalizedPath}`;
};
