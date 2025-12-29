
import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Job, JobService, JobDocument } from '../services/job.service';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 class="text-lg font-bold text-slate-800">
            @if (editMode) { Edit Application } @else { New Application }
          </h2>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto p-6 flex-1">
          <form [formGroup]="jobForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Basic Info Section -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Job Link</label>
                  <input type="url" formControlName="link" 
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="https://..."
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Stage</label>
                  <select formControlName="status" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                    @for (stage of jobService.stages(); track stage) {
                      <option [value]="stage">{{ stage }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input type="text" formControlName="company" 
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Google, Microsoft..."
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                  <input type="text" formControlName="title" 
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Software Engineer..."
                  >
                </div>
              </div>
            </div>

            <hr class="border-slate-100">

            <!-- Documents Section -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-slate-700">Required Documents</label>
                <button type="button" (click)="addDocument()" class="text-xs text-primary hover:text-indigo-700 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                  Add Document
                </button>
              </div>
              
              <div formArrayName="documents" class="space-y-2">
                @for (doc of documents.controls; track i; let i = $index) {
                  <div [formGroupName]="i" class="flex items-center gap-2">
                     <select formControlName="type" class="w-1/3 px-2 py-1.5 border border-slate-300 rounded-md text-sm bg-slate-50 focus:outline-none focus:border-primary">
                        <option value="resume">Resume</option>
                        <option value="cover_letter">Cover Letter</option>
                        <option value="portfolio">Portfolio</option>
                        <option value="reference">Reference</option>
                        <option value="other">Other</option>
                     </select>
                     <input type="text" formControlName="name" placeholder="Document Name" class="flex-1 px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-primary">
                     <div class="flex items-center gap-2">
                        <label class="flex items-center gap-1 text-xs text-slate-500 cursor-pointer select-none">
                          <input type="checkbox" formControlName="completed" class="rounded text-primary focus:ring-primary/20 border-slate-300">
                          Done
                        </label>
                        <button type="button" (click)="removeDocument(i)" class="text-slate-400 hover:text-red-500">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                        </button>
                     </div>
                  </div>
                }
                @if (documents.length === 0) {
                  <div class="text-sm text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                    No documents tracked yet. Add one above.
                  </div>
                }
              </div>
            </div>

            <hr class="border-slate-100">

            <!-- Details Section -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
                <textarea formControlName="description" rows="4" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="Paste the job description here..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea formControlName="notes" rows="2" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="Referral name, interview dates, etc."
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button type="button" (click)="close.emit()" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" (click)="onSubmit()" [disabled]="jobForm.invalid" class="px-6 py-2 bg-primary hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            @if (editMode) { Save Changes } @else { Add Application }
          </button>
        </div>
      </div>
    </div>
  `
})
export class JobFormComponent implements OnInit {
  @Input() jobData: Job | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  jobService = inject(JobService);
  private fb = inject(FormBuilder);
  
  jobForm!: FormGroup;
  editMode = false;

  get documents() {
    return this.jobForm.get('documents') as FormArray;
  }

  ngOnInit() {
    this.editMode = !!this.jobData;
    
    // Initialize form
    this.jobForm = this.fb.group({
      company: [this.jobData?.company || '', Validators.required],
      title: [this.jobData?.title || '', Validators.required],
      status: [this.jobData?.status || this.jobService.stages()[0] || 'Saved', Validators.required],
      link: [this.jobData?.link || ''],
      description: [this.jobData?.description || ''],
      notes: [this.jobData?.notes || ''],
      documents: this.fb.array([])
    });

    // Initialize documents
    if (this.jobData && this.jobData.documents) {
      this.jobData.documents.forEach(doc => this.addDocument(doc));
    } else if (!this.editMode) {
      // Default documents for new job
      this.addDocument({ id: crypto.randomUUID(), name: 'Resume', completed: false, type: 'resume' });
      this.addDocument({ id: crypto.randomUUID(), name: 'Cover Letter', completed: false, type: 'cover_letter' });
    }
  }

  addDocument(doc?: JobDocument) {
    const docGroup = this.fb.group({
      id: [doc?.id || crypto.randomUUID()],
      name: [doc?.name || 'New Document', Validators.required],
      completed: [doc?.completed || false],
      type: [doc?.type || 'other']
    });
    this.documents.push(docGroup);
  }

  removeDocument(index: number) {
    this.documents.removeAt(index);
  }

  onSubmit() {
    if (this.jobForm.valid) {
      this.save.emit(this.jobForm.value);
    }
  }
}
