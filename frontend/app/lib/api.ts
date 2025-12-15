const API = process.env.NEXT_PUBLIC_API_URL!;

/* ---------- BASE FETCH ---------- */
async function baseFetch(
  path: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include", // ✅ SEND COOKIES
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }

  return res.json();
}

/* ---------- LOGIN ---------- */
export async function login(email: string, password: string) {
  const res = await baseFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res; // e.g., { message: "Logged in" }
}


/* ---------- REGISTER ---------- */
export async function register(
  name: string,
  email: string,
  password: string
) {
  return baseFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/* ---------- LOGOUT ---------- */
export async function logout() {
  await baseFetch("/api/auth/logout", {
    method: "POST",
  });
}

/* ---------- PROFILE ---------- */
export function getProfile() {
  return baseFetch("/api/profile");
}

/* ---------- TASKS ---------- */
export function fetchTasks() {
  return baseFetch("/api/tasks");
}

/* ---------- CREATE TASK ---------- */
export function createTask(title: string) {
  return baseFetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

/* ---------- DELETE TASK ---------- */
export function deleteTask(id: string) {
  return baseFetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
}

/* ---------- UPDATE TASK ---------- */
export function updateTask(
  id: string,
  updates: { title?: string; completed?: boolean } // object, not string
) {
  return baseFetch(`/api/tasks/${id}`, {
    method: "PUT", // match backend
    body: JSON.stringify(updates),
  });
}
