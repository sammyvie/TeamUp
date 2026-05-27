import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Task {
  _id: string;
  name: string;
  description: string;
  taskNum: number;
  quest: string;
  partyMaster: any;
  status: 'todo' | 'done'; 
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/tasks`;
  private readonly _currentQuestTasks = signal<Task[]>([]);
  readonly currentQuestTasks = this._currentQuestTasks.asReadonly();

  getTasksByQuest(questId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API}/${questId}`).pipe(
      tap(tasks => this._currentQuestTasks.set(tasks))
    );
  }

  createTask(questId: string, taskData: { name: string; description: string }): Observable<Task> {
    return this.http.post<Task>(`${this.API}/${questId}`, taskData).pipe(
      tap(newTask => {
        this._currentQuestTasks.update(tasks => [newTask, ...tasks]);
      })
    );
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.API}/${taskId}`, updates).pipe(
      tap(updatedTask => {
        this._currentQuestTasks.update(tasks =>
          tasks.map(t => t._id === taskId ? updatedTask : t)
        );
      })
    );
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.API}/${taskId}`).pipe(
      tap(() => {
        this._currentQuestTasks.update(tasks => 
          tasks.filter(t => t._id !== taskId)
        );
      })
    );
  }

  clearTasks(): void {
    this._currentQuestTasks.set([]);
  }
}