export interface AuthSession {
  token: string;
  email: string;
  userId: string;
  role: string;
  isAdmin: boolean;
}

const TOKEN_KEY = "maxfunded_auth_token";
const USER_KEY = "maxfunded_auth_user";

export function saveSession(token: string, user: { id: string; email: string; role: string; is_admin: boolean }) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;
  try {
    const user = JSON.parse(rawUser);
    return {
      token,
      email: user.email,
      userId: user.id || user.user_id,
      role: user.role,
      isAdmin: user.is_admin,
    };
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
  }
}
