export interface HotelUser {
  id: number;
  hotelId: number;
  username: string;
  role: string;
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  photo?: string;
  baseRate: number;
}

export interface Admin {
  id: number;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: HotelUser;
  hotel?: Hotel;
  admin?: Admin;
  role?: "hotel" | "admin";
}

class AuthManager {
  private state: AuthState = {
    isAuthenticated: false,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async loginHotel(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/auth/hotel/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const { user, hotel } = await response.json();
      
      this.state = {
        isAuthenticated: true,
        user,
        hotel,
        role: "hotel",
      };

      localStorage.setItem("auth", JSON.stringify(this.state));
      this.notify();

      return { success: true };
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  }

  async loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const { admin } = await response.json();
      
      this.state = {
        isAuthenticated: true,
        admin,
        role: "admin",
      };

      localStorage.setItem("auth", JSON.stringify(this.state));
      this.notify();

      return { success: true };
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  }

  logout() {
    this.state = {
      isAuthenticated: false,
    };

    localStorage.removeItem("auth");
    this.notify();
  }

  getState(): AuthState {
    return { ...this.state };
  }

  initialize() {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        this.state = JSON.parse(stored);
        this.notify();
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
      localStorage.removeItem("auth");
    }
  }
}

export const authManager = new AuthManager();

// Initialize auth state on app start
if (typeof window !== "undefined") {
  authManager.initialize();
}
