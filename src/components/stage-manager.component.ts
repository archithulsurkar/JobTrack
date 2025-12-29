
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../services/job.service';

@Component({
  selector: 'app-stage-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" (click)="$event.stopPropagation()">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 class="text-lg font-bold text-slate-800">Manage Stages</h2>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <p class="text-sm text-slate-500 mb-4">Customize your application pipeline. You cannot delete stages that currently contain jobs.</p>

          <!-- Stage List -->
          <div class="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
            @for (stage of jobService.stages(); track stage; let i = $index) {
              <div class="flex items-center gap-2 group">
                <div class="flex-1">
                  @if (editingIndex === i) {
                    <input 
                      #editInput
                      type="text" 
                      [ngModel]="stage" 
                      (blur)="finishEditing(stage, editInput.value, i)"
                      (keydown.enter)="editInput.blur()"
                      class="w-full px-2 py-1 border border-primary rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    >
                  } @else {
                    <div class="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                      <span class="font-medium text-slate-700">{{ stage }}</span>
                      <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button (click)="startEditing(i)" class="text-slate-400 hover:text-blue-500" title="Rename">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                         </button>
                         <button (click)="deleteStage(stage)" class="text-slate-400 hover:text-red-500" title="Delete">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                         </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Add Stage -->
          <div class="flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="newStageName" 
              (keydown.enter)="addNewStage()"
              placeholder="New stage name..."
              class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            >
            <button 
              (click)="addNewStage()"
              [disabled]="!newStageName.trim()"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              Add
            </button>
          </div>
          
          <div *ngIf="errorMsg" class="mt-2 text-xs text-red-500">
            {{ errorMsg }}
          </div>

        </div>
        
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button (click)="close.emit()" class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors shadow-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  `
})
export class StageManagerComponent {
  @Output() close = new EventEmitter<void>();
  jobService = inject(JobService);

  newStageName = '';
  editingIndex: number | null = null;
  errorMsg = '';

  addNewStage() {
    if (this.newStageName.trim()) {
      this.jobService.addStage(this.newStageName.trim());
      this.newStageName = '';
      this.errorMsg = '';
    }
  }

  deleteStage(name: string) {
    const success = this.jobService.removeStage(name);
    if (!success) {
      this.errorMsg = `Cannot delete '${name}' because it contains applications. Move them first.`;
    } else {
      this.errorMsg = '';
    }
  }

  startEditing(index: number) {
    this.editingIndex = index;
    this.errorMsg = '';
  }

  finishEditing(oldName: string, newName: string, index: number) {
    if (this.editingIndex === index) {
      this.jobService.renameStage(oldName, newName);
      this.editingIndex = null;
    }
  }
}
