const API = process.env.NEXT_PUBLIC_API_URL!;
if (!API) throw new Error("NEXT_PUBLIC_API_URL is not defined");

/* ============================= */
/*           API ERROR           */
/* ============================= */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* ============================= */
/*         GLOBAL AUTH STATE     */
/* ============================= */
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Optional: global callback for logout UX
let onLogoutCallback: (() => void) | null = null;
export function setLogoutCallback(callback: () => void) {
  onLogoutCallback = callback;
}

/* ============================= */
/*     REFRESH ACCESS TOKEN      */
/* ============================= */
async function refreshAccessToken(): Promise<void> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        // Failed refresh → global logout
        if (onLogoutCallback) onLogoutCallback();
        throw new ApiError("Session expired", 401);
      }
      // Success → new accessToken is in HttpOnly cookie, no parsing needed
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ============================= */
/*           BASE FETCH           */
/* ============================= */
interface ApiErrorResponse {
  error: string;
  message?: string;
}

async function baseFetch<T>(
  path: string,
  options: RequestInit = {},
  timeout = 10000,
  retry = true
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const headers: HeadersInit = {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API}${path}`, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    if (res.status === 204) return null as unknown as T;

    let rawData: unknown = null;
    try {
      rawData = await res.json();
    } catch {}

    if (res.status === 401 && retry) {
      // Try refresh once
      clearTimeout(timeoutId);
      await refreshAccessToken();
      return baseFetch<T>(path, options, timeout, false);
    }

    if (!res.ok) {
      let message = "Request failed";
      if (rawData && typeof rawData === "object" && rawData !== null) {
        const errData = rawData as ApiErrorResponse;
        message = errData.error ?? errData.message ?? message;
      }
      throw new ApiError(message, res.status);
    }

    return rawData as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408);
    }

    throw new ApiError("Network error", 0);
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ============================= */
/*         RESPONSE TYPES        */
/* ============================= */
export interface AuthResponse {
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ============================= */
/*            AUTH               */
/* ============================= */
export function login(email: string, password: string): Promise<AuthResponse> {
  return baseFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return baseFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout(): Promise<null> {
  // Trigger UI logout callback on client
  if (onLogoutCallback) onLogoutCallback();
  return baseFetch<null>("/api/auth/logout", { method: "POST" });
}

export function getProfile(): Promise<User> {
  return baseFetch<User>("/api/profile");
}

export function updateProfile(
  updates: { name?: string; email?: string; password?: string }
): Promise<AuthResponse> {
  return baseFetch<AuthResponse>("/api/auth/update", {
    method: "POST",
    body: JSON.stringify(updates),
  });
}

/* ============================= */
/*            TASKS              */
/* ============================= */
export function fetchTasks(): Promise<Task[]> {
  return baseFetch<Task[]>("/api/tasks");
}

export function createTask(title: string): Promise<Task> {
  return baseFetch<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function deleteTask(id: string): Promise<null> {
  return baseFetch<null>(`/api/tasks/${id}`, { method: "DELETE" });
}

export function updateTask(
  id: string,
  updates: { title?: string; completed?: boolean }
): Promise<Task> {
  return baseFetch<Task>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}