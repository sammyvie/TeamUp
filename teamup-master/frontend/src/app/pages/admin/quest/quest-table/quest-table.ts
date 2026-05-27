import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quest } from '../../../../core/services/quest.service';

@Component({
  selector: 'app-quest-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-table.html',
  styleUrl: './quest-table.css'
})
  
export class QuestTable {
  @Input() quests: any[] = []; 

  formatStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

  getClientName(commissioner: any): string {
    if (!commissioner) return 'Unknown Client';
    return typeof commissioner === 'object' ? commissioner.fullName : 'Loading...';
  }

  getPartyName(party: any): string {
    if (!party) return 'No Party Assigned';
    return typeof party === 'object' ? (party.name || 'Active Party') : 'Assigned';
  }
}