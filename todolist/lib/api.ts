const API = process.env.NEXT_PUBLIC_API_URL!;

if (!API) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

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
/*          BASE FETCH           */
/* ============================= */

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

interface RefreshSuccess {
  accessToken: string;
}

interface RefreshError {
  error: string;
}

type RefreshResponse = RefreshSuccess | RefreshError;

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;

  refreshPromise = (async () => {
    const res = await fetch(`${API}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    let data: RefreshResponse | null = null;
    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      const message = data && "error" in data ? data.error : "Session expired";
      throw new ApiError(message, 401);
    }

    if (data && "accessToken" in data) {
      // Example: localStorage.setItem("token", data.accessToken);
    }
  })();

  try {
    await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

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
      credentials: "include",
      headers,
      signal: controller.signal,
    });

    if (res.status === 204) return null as unknown as T;

    let rawData: unknown = null;
    try {
      rawData = await res.json();
    } catch {
      rawData = null;
    }

    if (res.status === 401 && retry) {
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

    if (error instanceof DOMException && error.name === "AbortError")
      throw new ApiError("Request timeout", 408);

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

// **NOTE:** Use `_id` to match your frontend hook
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
  return baseFetch<null>("/api/auth/logout", { method: "POST" });
}

export function getProfile(): Promise<User> {
  return baseFetch<User>("/api/profile");
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
