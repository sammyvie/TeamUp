import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quest-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-filter.html',
  styleUrl: './quest-filter.css'
})
export class QuestFilter {
  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange  = new EventEmitter<string>();
  @Output() filterClick   = new EventEmitter<void>();

  searchTerm = '';

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.searchChange.emit(this.searchTerm);
  }

  onStatusSelect(event: Event): void {
    this.statusChange.emit((event.target as HTMLSelectElement).value);
  }

  onFilter(): void {
    this.filterClick.emit();
  }
}