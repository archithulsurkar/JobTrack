
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MongoConfig, MongoService } from '../services/mongo.service';

@Component({
  selector: 'app-db-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            Connect to MongoDB Atlas
          </h2>
          <p class="text-sm text-slate-500 mt-1">
            Configure the Atlas Data API to start saving data.
          </p>
        </div>

        <div class="p-6">
          <form [formGroup]="configForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Data API URL Endpoint</label>
              <input formControlName="apiUrl" type="url" placeholder="https://.../endpoint/data/v1" 
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-mono">
              <p class="text-[10px] text-slate-400 mt-1">Found in Atlas > App Services > [Your App] > HTTPS Endpoints</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Data API Key</label>
              <input formControlName="apiKey" type="password" placeholder="Key..." 
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-mono">
              <p class="text-[10px] text-slate-400 mt-1">Create in Atlas > App Services > Users > API Keys</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Cluster Name</label>
                <input formControlName="cluster" type="text" placeholder="Cluster0" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Database Name</label>
                <input formControlName="database" type="text" placeholder="jobtrack" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm">
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
              <strong>Note:</strong> Your API Key is stored only in your browser's Local Storage. 
              Ensure your Atlas Data API is enabled and your network access IP list includes your current IP (or 0.0.0.0/0 for global access).
            </div>

            <div class="pt-2">
              <button type="submit" [disabled]="configForm.invalid" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Save & Connect
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class DbConfigComponent {
  private mongoService = inject(MongoService);
  private fb = inject(FormBuilder);

  configForm: FormGroup = this.fb.group({
    apiUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    apiKey: ['', Validators.required],
    cluster: ['Cluster0', Validators.required],
    database: ['jobtrack', Validators.required]
  });

  onSubmit() {
    if (this.configForm.valid) {
      this.mongoService.saveConfig(this.configForm.value as MongoConfig);
    }
  }
}
