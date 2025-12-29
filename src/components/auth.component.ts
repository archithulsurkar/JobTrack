
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center mb-6">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200">
            J
          </div>
        </div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          @if (isLogin()) { Sign in to your account } @else { Create your account }
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600">
          Or
          <button (click)="toggleMode()" class="font-medium text-primary hover:text-indigo-500 transition-colors">
             @if (isLogin()) { create a new account } @else { sign in to existing account }
          </button>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          
          <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            @if (!isLogin()) {
              <div>
                <label for="name" class="block text-sm font-medium text-slate-700">Full Name</label>
                <div class="mt-1">
                  <input id="name" type="text" formControlName="name" class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all">
                </div>
              </div>
            }

            <div>
              <label for="email" class="block text-sm font-medium text-slate-700">Email address</label>
              <div class="mt-1">
                <input id="email" type="email" formControlName="email" class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
              <div class="mt-1">
                <input id="password" type="password" formControlName="password" class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all">
              </div>
            </div>

            @if (errorMessage()) {
              <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">{{ errorMessage() }}</h3>
                  </div>
                </div>
              </div>
            }

            <div>
              <button type="submit" [disabled]="authForm.invalid" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                @if (isLogin()) { Sign in } @else { Create account }
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  isLogin = signal(true);
  errorMessage = signal('');

  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: [''] // Only required for signup
  });

  toggleMode() {
    this.isLogin.update(v => !v);
    this.errorMessage.set('');
    this.authForm.reset();
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    const { email, password, name } = this.authForm.value;
    this.errorMessage.set('');
    
    let result;
    if (this.isLogin()) {
      result = this.authService.login(email, password);
    } else {
      if (!name) {
        this.errorMessage.set('Name is required');
        return;
      }
      result = this.authService.signup(name, email, password);
    }

    if (!result.success) {
      this.errorMessage.set(result.message);
    }
  }
}
