import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Party } from '../admin-chat-logs';

@Component({
  selector: 'app-party-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './party-list.html',
  styleUrl: './party-list.css'
})
export class PartyList implements OnChanges {
  @Input() parties: Party[] = [];
  @Input() selectedPartyId?: number;
  @Output() partySelected = new EventEmitter<Party>();

  searchTerm = '';
  filteredParties: Party[] = [];

  ngOnChanges(): void {
    this.filteredParties = [...this.parties];
  }

  onSearch(): void {
    this.filteredParties = this.parties.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectParty(party: Party): void {
    this.partySelected.emit(party);
  }

  get filteredList(): Party[] {
    return this.parties.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}