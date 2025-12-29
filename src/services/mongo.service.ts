
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

export interface MongoConfig {
  apiUrl: string;
  apiKey: string;
  cluster: string;
  database: string;
}

@Injectable({
  providedIn: 'root'
})
export class MongoService {
  private http = inject(HttpClient);
  
  readonly isConfigured = signal(false);
  private config: MongoConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    const stored = localStorage.getItem('jobtrack_mongo_config');
    if (stored) {
      try {
        this.config = JSON.parse(stored);
        this.isConfigured.set(true);
      } catch (e) {
        this.isConfigured.set(false);
      }
    } else {
      this.isConfigured.set(false);
    }
  }

  saveConfig(config: MongoConfig) {
    // Validate trailing slash on URL
    if (config.apiUrl.endsWith('/')) {
      config.apiUrl = config.apiUrl.slice(0, -1);
    }
    
    this.config = config;
    localStorage.setItem('jobtrack_mongo_config', JSON.stringify(config));
    this.isConfigured.set(true);
  }

  resetConfig() {
    localStorage.removeItem('jobtrack_mongo_config');
    this.config = null;
    this.isConfigured.set(false);
  }

  // --- Generic Data API Methods ---

  private get headers() {
    if (!this.config) throw new Error('Database not configured');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': this.config.apiKey
    });
  }

  private get bodyBase() {
    if (!this.config) throw new Error('Database not configured');
    return {
      dataSource: this.config.cluster,
      database: this.config.database,
    };
  }

  findOne<T>(collection: string, filter: any): Observable<T | null> {
    if (!this.isConfigured()) return throwError(() => new Error('DB Config Missing'));

    const url = `${this.config!.apiUrl}/action/findOne`;
    const body = {
      ...this.bodyBase,
      collection,
      filter
    };

    return this.http.post<{ document: T }>(url, body, { headers: this.headers }).pipe(
      map(res => res.document || null),
      catchError(err => {
        console.error('Mongo FindOne Error', err);
        return throwError(() => err);
      })
    );
  }

  find<T>(collection: string, filter: any, sort: any = {}): Observable<T[]> {
    if (!this.isConfigured()) return throwError(() => new Error('DB Config Missing'));

    const url = `${this.config!.apiUrl}/action/find`;
    const body = {
      ...this.bodyBase,
      collection,
      filter,
      sort,
      limit: 1000
    };

    return this.http.post<{ documents: T[] }>(url, body, { headers: this.headers }).pipe(
      map(res => res.documents || []),
      catchError(err => {
        console.error('Mongo Find Error', err);
        return throwError(() => err);
      })
    );
  }

  insertOne<T>(collection: string, document: T): Observable<string> {
    if (!this.isConfigured()) return throwError(() => new Error('DB Config Missing'));

    const url = `${this.config!.apiUrl}/action/insertOne`;
    const body = {
      ...this.bodyBase,
      collection,
      document
    };

    return this.http.post<{ insertedId: string }>(url, body, { headers: this.headers }).pipe(
      map(res => res.insertedId),
      catchError(err => {
        console.error('Mongo InsertOne Error', err);
        return throwError(() => err);
      })
    );
  }

  updateOne(collection: string, filter: any, update: any): Observable<any> {
    if (!this.isConfigured()) return throwError(() => new Error('DB Config Missing'));

    const url = `${this.config!.apiUrl}/action/updateOne`;
    const body = {
      ...this.bodyBase,
      collection,
      filter,
      update
    };

    return this.http.post(url, body, { headers: this.headers });
  }

  deleteOne(collection: string, filter: any): Observable<any> {
    if (!this.isConfigured()) return throwError(() => new Error('DB Config Missing'));

    const url = `${this.config!.apiUrl}/action/deleteOne`;
    const body = {
      ...this.bodyBase,
      collection,
      filter
    };

    return this.http.post(url, body, { headers: this.headers });
  }
}
