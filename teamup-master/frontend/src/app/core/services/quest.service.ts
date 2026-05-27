import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Quest {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  deadline: Date;
  status: 'open' | 'in_progress' | 'completed';
  githubRepo: {
    owner: string;
    name: string;
  };
  commissioner: any;
  party?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/quests`;

  private readonly _quests = signal<Quest[]>([]);
  readonly quests = this._quests.asReadonly();

  getQuests(): Observable<Quest[]> {
    return this.http.get<Quest[]>(this.API).pipe(
      tap(data => this._quests.set(data))
    );
  }

  getQuestsByParty(partyId: string): Observable<Quest[]> {
    return this.http.get<Quest[]>(`${this.API}/party/${partyId}`);
  }

  getQuestById(id: string): Observable<Quest> {
    return this.http.get<Quest>(`${this.API}/${id}`);
  }

  createQuest(questData: any): Observable<Quest> {
    return this.http.post<Quest>(this.API, questData).pipe(
      tap(newQuest => {
        this._quests.update(current => [newQuest, ...current]);
      })
    );
  }

  updateQuest(id: string, updates: Partial<Quest>): Observable<Quest> {
    return this.http.put<Quest>(`${this.API}/${id}`, updates).pipe(
      tap(updated => {
        this._quests.update(current => 
          current.map(q => q._id === id ? updated : q)
        );
      })
    );
  }

  completeQuest(id: string): Observable<any> {
    return this.http.post<any>(`${this.API}/${id}/complete`, {}).pipe(
      tap(() => this.getQuests().subscribe()) 
    );
  }
}