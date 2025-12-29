
import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // The current logged in user
  readonly currentUser = signal<User | null>(null);
  
  // Derived state
  readonly isLoggedIn = computed(() => !!this.currentUser());

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    const stored = localStorage.getItem('jobtrack_session');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.currentUser.set(user);
      } catch (e) {
        localStorage.removeItem('jobtrack_session');
      }
    }
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const usersStr = localStorage.getItem('jobtrack_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
      // Create session (exclude password from session object)
      const sessionUser = { ...user };
      delete sessionUser.password;
      
      this.currentUser.set(sessionUser);
      localStorage.setItem('jobtrack_session', JSON.stringify(sessionUser));
      return { success: true, message: 'Welcome back!' };
    }

    return { success: false, message: 'Invalid email or password.' };
  }

  signup(name: string, email: string, password: string): { success: boolean; message: string } {
    const usersStr = localStorage.getItem('jobtrack_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already in use.' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password
    };

    users.push(newUser);
    localStorage.setItem('jobtrack_users', JSON.stringify(users));

    // Auto login
    return this.login(email, password);
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('jobtrack_session');
  }
}
