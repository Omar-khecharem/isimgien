import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthenticatedUser, LoginCredentials, Role } from "../../types";
import { authService } from "./authService";

// ─── State ──────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

type AuthAction =
  | { type: "INIT_START" }
  | { type: "INIT_COMPLETE"; payload: AuthenticatedUser | null }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: AuthenticatedUser }
  | { type: "LOGOUT" }
  | { type: "USER_UPDATE"; payload: Partial<AuthenticatedUser> };

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INIT_START":
      return { ...state, isLoading: true };
    case "INIT_COMPLETE":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isInitialized: true,
        isLoading: false,
      };
    case "LOGIN_START":
      return { ...state, isLoading: true };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "USER_UPDATE":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      dispatch({ type: "INIT_START" });
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const user = await authService.getMe();
          if (!cancelled) {
            dispatch({ type: "INIT_COMPLETE", payload: user });
          }
        } else {
          const refreshed = await authService.refresh();
          if (refreshed && !cancelled) {
            const user = await authService.getMe();
            dispatch({ type: "INIT_COMPLETE", payload: user });
          } else if (!cancelled) {
            dispatch({ type: "INIT_COMPLETE", payload: null });
          }
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: "INIT_COMPLETE", payload: null });
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: "LOGIN_START" });
    const { user } = await authService.login(credentials);
    dispatch({ type: "LOGIN_SUCCESS", payload: user });
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: "LOGOUT" });
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
