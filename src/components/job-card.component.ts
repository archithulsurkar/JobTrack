
import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job, JobService } from '../services/job.service';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden select-none"
      [class.p-3]="!isExpanded()" 
      [class.p-4]="isExpanded()"
      (click)="toggleExpand()"
    >
      
      <!-- Header Row (Always Visible) -->
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0"> <!-- min-w-0 for truncation -->
          <h3 class="font-bold text-slate-800 leading-tight truncate" 
              [class.text-sm]="!isExpanded()" 
              [class.text-lg]="isExpanded()">
              {{ job.company }}
          </h3>
          <p class="text-slate-500 font-medium truncate transition-all"
             [class.text-xs]="!isExpanded()" 
             [class.text-sm]="isExpanded()">
             {{ job.title }}
          </p>
        </div>

        <!-- Menu & Compact Status -->
        <div class="flex flex-col items-end gap-1 shrink-0">
          <div class="relative h-5" (click)="$event.stopPropagation()">
            <button (click)="toggleMenu()" class="text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" [class.opacity-100]="showMenu()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            @if (showMenu()) {
              <div class="absolute right-0 top-6 w-32 bg-white border border-slate-200 shadow-xl rounded-lg z-20 py-1 flex flex-col">
                <button (click)="onEdit()" class="text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full">Edit</button>
                <button (click)="onDelete()" class="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">Delete</button>
              </div>
              <div class="fixed inset-0 z-10" (click)="toggleMenu()"></div>
            }
          </div>
          
          <!-- Compact Status Badge -->
          @if (!isExpanded()) {
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 max-w-[80px] truncate border border-slate-100 mt-1">
              {{ job.status }}
            </span>
          }
        </div>
      </div>

      <!-- Expanded Content -->
      @if (isExpanded()) {
        <div class="mt-3 flex flex-col gap-3 border-t border-slate-50 pt-3">
          
          <!-- Documents Checklist -->
          @if (job.documents && job.documents.length > 0) {
            <div class="space-y-1">
              @for (doc of job.documents; track doc.id) {
                <div class="flex items-center gap-2 group/doc" (click)="$event.stopPropagation()">
                  <button (click)="toggleDoc(doc.id, $event)" 
                    class="w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0"
                    [class.bg-emerald-500]="doc.completed"
                    [class.border-emerald-500]="doc.completed"
                    [class.border-slate-300]="!doc.completed"
                    [class.hover:border-emerald-400]="!doc.completed"
                    title="Mark as completed"
                  >
                     @if (doc.completed) {
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                         <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                       </svg>
                     }
                  </button>
                  <span class="text-xs text-slate-500 truncate" [class.line-through]="doc.completed" [class.opacity-75]="doc.completed">
                    {{ doc.name }}
                  </span>
                </div>
              }
            </div>
          }

          <!-- Links & Metadata -->
          <div class="flex items-center gap-3 text-xs text-slate-400" (click)="$event.stopPropagation()">
            <span>Added {{ formatDate(job.dateAdded) }}</span>
            @if (job.link) {
              <a [href]="job.link" target="_blank" class="text-primary hover:underline flex items-center gap-1">
                Link
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
              </a>
            }
          </div>

          <!-- Status Footer -->
          <div class="flex justify-between items-center">
            <span class="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600 truncate">
              {{ job.status }}
            </span>
          </div>
        </div>
      }
    </div>
  `
})
export class JobCardComponent {
  @Input({ required: true }) job!: Job;
  @Output() edit = new EventEmitter<Job>();
  @Output() delete = new EventEmitter<string>();

  private jobService = inject(JobService);
  
  showMenu = signal(false);
  isExpanded = signal(false);

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  onEdit() {
    this.edit.emit(this.job);
    this.showMenu.set(false);
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this application?')) {
      this.delete.emit(this.job.id);
    }
    this.showMenu.set(false);
  }

  toggleDoc(docId: string, event: Event) {
    event.stopPropagation();
    this.jobService.toggleDocument(this.job.id, docId);
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
