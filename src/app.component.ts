
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService, Job } from './services/job.service';
import { AuthService } from './services/auth.service';
import { JobCardComponent } from './components/job-card.component';
import { JobFormComponent } from './components/job-form.component';
import { StatsChartComponent } from './components/stats-chart.component';
import { StageManagerComponent } from './components/stage-manager.component';
import { AuthComponent } from './components/auth.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    JobCardComponent, 
    JobFormComponent, 
    StatsChartComponent, 
    StageManagerComponent, 
    AuthComponent
  ],
  templateUrl: './app.component.html',
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 20px;
    }
    .drag-over-active {
      background-color: #e0e7ff; /* indigo-100 */
      border-color: #6366f1; /* indigo-500 */
    }
  `]
})
export class AppComponent {
  jobService = inject(JobService);
  authService = inject(AuthService);
  
  showModal = signal(false);
  showStageManager = signal(false);
  editingJob: Job | null = null;
  
  // Drag and Drop State
  draggingJob: Job | null = null;
  dragOverStage = signal<string | null>(null);

  private colors = [
    'bg-slate-400',
    'bg-blue-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-red-500',
    'bg-violet-500',
    'bg-pink-500',
    'bg-cyan-500'
  ];

  getJobsByStatus(status: string) {
    const allJobs = this.jobService.jobs();
    return allJobs.filter(j => j.status === status);
  }

  getStageColor(index: number): string {
    return this.colors[index % this.colors.length];
  }
  
  openAddJobModal() {
    this.editingJob = null;
    this.showModal.set(true);
  }

  openEditJobModal(job: Job) {
    this.editingJob = job;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingJob = null;
  }

  openStageManager() {
    this.showStageManager.set(true);
  }

  closeStageManager() {
    this.showStageManager.set(false);
  }

  handleSave(formData: any) {
    if (this.editingJob) {
      this.jobService.updateJob({ ...this.editingJob, ...formData });
    } else {
      this.jobService.addJob(formData);
    }
    this.closeModal();
  }

  deleteJob(id: string) {
    this.jobService.deleteJob(id);
  }

  logout() {
    this.authService.logout();
  }

  // --- Drag and Drop Handlers ---

  onDragStart(event: DragEvent, job: Job) {
    this.draggingJob = job;
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', job.id);
  }

  onDragEnd(event: DragEvent) {
    this.draggingJob = null;
    this.dragOverStage.set(null);
  }

  onDragOver(event: DragEvent, stage: string) {
    event.preventDefault(); 
    if (this.draggingJob && this.draggingJob.status !== stage) {
      this.dragOverStage.set(stage);
      event.dataTransfer!.dropEffect = 'move';
    } else {
      this.dragOverStage.set(null);
      event.dataTransfer!.dropEffect = 'none';
    }
  }

  onDrop(event: DragEvent, stage: string) {
    event.preventDefault();
    this.dragOverStage.set(null);
    
    if (this.draggingJob && this.draggingJob.status !== stage) {
      this.jobService.updateJob({ ...this.draggingJob, status: stage });
    }
    this.draggingJob = null;
  }
}
