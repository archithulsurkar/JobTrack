
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface JobDocument {
  id: string;
  name: string;
  completed: boolean;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'reference' | 'other';
}

export interface Job {
  id: string;
  userId: string;
  company: string;
  title: string;
  status: string;
  dateAdded: string;
  description: string;
  link?: string;
  notes?: string;
  documents: JobDocument[];
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private authService = inject(AuthService);

  readonly jobs = signal<Job[]>([]);
  readonly stages = signal<string[]>([]);
  
  // Note: isLoading removed as LocalStorage is synchronous

  readonly stats = computed(() => {
    const all = this.jobs();
    const stageCounts: Record<string, number> = {};
    
    this.stages().forEach(s => stageCounts[s] = 0);
    
    all.forEach(j => {
      if (stageCounts[j.status] !== undefined) {
        stageCounts[j.status]++;
      }
    });

    return {
      total: all.length,
      byStage: stageCounts
    };
  });

  constructor() {
    // Reload data whenever the current user changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadData(user.id);
      } else {
        this.jobs.set([]);
        this.stages.set([]);
      }
    });
  }

  private loadData(userId: string) {
    const storedJobs = localStorage.getItem(`jobtrack_data_${userId}`);
    const storedStages = localStorage.getItem(`jobtrack_stages_${userId}`);

    // Load Stages
    if (storedStages) {
      try {
        this.stages.set(JSON.parse(storedStages));
      } catch (e) {
        this.setDefaultStages(userId);
      }
    } else {
      this.setDefaultStages(userId);
    }

    // Load Jobs
    if (storedJobs) {
      try {
        const parsedJobs: Job[] = JSON.parse(storedJobs);
        // Ensure documents array exists for legacy data
        const migratedJobs = parsedJobs.map(j => ({
          ...j,
          documents: j.documents || []
        }));
        this.jobs.set(migratedJobs);
      } catch (e) {
        console.error('Failed to parse jobs', e);
        this.jobs.set([]);
      }
    } else {
      this.jobs.set([]);
    }
  }

  private setDefaultStages(userId: string) {
    const defaults = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];
    this.stages.set(defaults);
    localStorage.setItem(`jobtrack_stages_${userId}`, JSON.stringify(defaults));
  }

  private saveJobs() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    localStorage.setItem(`jobtrack_data_${userId}`, JSON.stringify(this.jobs()));
  }

  private saveStages() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    localStorage.setItem(`jobtrack_stages_${userId}`, JSON.stringify(this.stages()));
  }

  // --- Job Methods ---

  addJob(jobData: Omit<Job, 'id' | 'dateAdded' | 'userId'>) {
    const user = this.authService.currentUser();
    if (!user) return;

    const newJob: Job = {
      ...jobData,
      id: crypto.randomUUID(),
      userId: user.id,
      dateAdded: new Date().toISOString()
    };
    this.jobs.update(list => [newJob, ...list]);
    this.saveJobs();
  }

  updateJob(updatedJob: Job) {
    this.jobs.update(list => 
      list.map(j => j.id === updatedJob.id ? updatedJob : j)
    );
    this.saveJobs();
  }

  deleteJob(id: string) {
    this.jobs.update(list => list.filter(j => j.id !== id));
    this.saveJobs();
  }

  toggleDocument(jobId: string, docId: string) {
    this.jobs.update(list => list.map(job => {
      if (job.id !== jobId) return job;
      return {
        ...job,
        documents: job.documents.map(d => d.id === docId ? { ...d, completed: !d.completed } : d)
      };
    }));
    this.saveJobs();
  }

  // --- Stage Methods ---

  addStage(name: string) {
    if (!name.trim()) return;
    if (this.stages().includes(name)) return;
    this.stages.update(s => [...s, name]);
    this.saveStages();
  }

  removeStage(name: string): boolean {
    if (this.jobs().some(j => j.status === name)) {
      return false;
    }
    this.stages.update(s => s.filter(n => n !== name));
    this.saveStages();
    return true;
  }

  renameStage(oldName: string, newName: string) {
    if (!newName.trim() || oldName === newName) return;
    
    this.stages.update(s => s.map(n => n === oldName ? newName : n));
    this.saveStages();

    this.jobs.update(list => list.map(j => j.status === oldName ? { ...j, status: newName } : j));
    this.saveJobs();
  }
}
