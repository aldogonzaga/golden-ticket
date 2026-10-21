import type { Invitation, Settings, Message, Activity } from "./store";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://127.0.0.1:8000/api";

function getToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem("sambut-token") : null;
}

export function setToken(token: string | null) {
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem("sambut-token", token);
    else localStorage.removeItem("sambut-token");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

// ----------------- Auth -----------------
export async function loginApi(username: string, password: string) {
  const res = await request<{
    success: boolean;
    token: string;
    user: { id: number; name: string; username: string; email: string };
  }>("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (res.token) setToken(res.token);
  return res;
}

export async function logoutApi() {
  try {
    await request<{ success: boolean }>("/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}

export async function getMeApi() {
  return request<{ success: boolean; user: any }>("/me");
}

// ----------------- Invitations -----------------
export async function getInvitationsApi(params?: {
  category?: string;
  search?: string;
  rsvp?: string;
  attendance?: string;
  mou?: string;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  if (params?.rsvp) query.set("rsvp", params.rsvp);
  if (params?.attendance) query.set("attendance", params.attendance);
  if (params?.mou) query.set("mou", params.mou);

  const qs = query.toString();
  return request<{ success: boolean; data: Invitation[] }>(`/invitations${qs ? `?${qs}` : ""}`);
}

export async function getInvitationApi(idOrCode: string) {
  return request<{ success: boolean; data: Invitation }>(`/invitations/${encodeURIComponent(idOrCode)}`);
}

export async function createInvitationApi(invitation: Partial<Invitation>) {
  return request<{ success: boolean; data: Invitation; message: string }>("/invitations", {
    method: "POST",
    body: JSON.stringify(invitation),
  });
}

export async function updateInvitationApi(idOrCode: string, invitation: Partial<Invitation>) {
  return request<{ success: boolean; data: Invitation; message: string }>(
    `/invitations/${encodeURIComponent(idOrCode)}`,
    {
      method: "PUT",
      body: JSON.stringify(invitation),
    },
  );
}

export async function deleteInvitationApi(idOrCode: string) {
  return request<{ success: boolean; message: string }>(`/invitations/${encodeURIComponent(idOrCode)}`, {
    method: "DELETE",
  });
}

export async function importInvitationsApi(items: Partial<Invitation>[]) {
  return request<{ success: boolean; message: string; count: number }>("/invitations/import", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// ----------------- Presensi / Check-In -----------------
export async function verifyCheckInApi(identifier: string) {
  return request<{ success: boolean; data: Invitation; message?: string }>(
    `/check-in/verify/${encodeURIComponent(identifier)}`,
  );
}

export async function checkInApi(payload: {
  id?: string;
  code?: string;
  member_ids?: string[];
  count?: number;
}) {
  return request<{
    success: boolean;
    message: string;
    added: number;
    data: Invitation;
  }>("/check-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----------------- Public Ticket & School Portal -----------------
export async function getPublicDataApi() {
  return request<{
    success: boolean;
    settings: Settings;
    messages: Message[];
    activities: Activity[];
  }>("/public/data");
}

export async function getPublicInvitationApi(code: string) {
  return request<{ success: boolean; data: Invitation }>(`/public/invitations/${encodeURIComponent(code)}`);
}

export async function submitRsvpApi(code: string, payload: { rsvp: string; phone?: string; pic?: string }) {
  return request<{ success: boolean; message: string; data: Invitation }>(
    `/public/rsvp/${encodeURIComponent(code)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateSchoolMembersApi(
  code: string,
  payload: { members: any[]; pic?: string; phone?: string; principal?: string },
) {
  return request<{ success: boolean; message: string; data: Invitation }>(
    `/public/schools/${encodeURIComponent(code)}/members`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

// ----------------- Messages (Ucapan & Doa) -----------------
export async function getMessagesApi() {
  return request<{ success: boolean; data: Message[] }>("/messages");
}

export async function addMessageApi(message: { name: string; text: string; category?: string }) {
  return request<{ success: boolean; message: string; data: Message }>("/messages", {
    method: "POST",
    body: JSON.stringify(message),
  });
}

export async function getActivitiesApi() {
  return request<{ success: boolean; data: Activity[] }>("/activities");
}

// ----------------- Settings & Stats -----------------
export async function getSettingsApi() {
  return request<{ success: boolean; data: Settings }>("/settings");
}

export async function updateSettingsApi(settings: Partial<Settings>) {
  return request<{ success: boolean; message: string; data: Settings }>("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function getStatsApi() {
  return request<{ success: boolean; data: any }>("/stats");
}

export async function getExportDataApi() {
  return request<{ success: boolean; data: Record<string, any>[] }>("/reports/export");
}

export async function resetSimulationApi() {
  return request<{ success: boolean; message: string }>("/reset", {
    method: "POST",
  });
}
