import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-filter.html',
  styleUrl: './users-filter.css'
})
export class UsersFilter {
  @Output() searchChange = new EventEmitter<string>();
  @Output() roleChange   = new EventEmitter<string>();
  @Output() filterClick  = new EventEmitter<void>();

  searchTerm = '';

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.searchChange.emit(this.searchTerm);
  }

  onRoleSelect(event: Event): void {
    this.roleChange.emit((event.target as HTMLSelectElement).value);
  }

  onFilter(): void {
    this.filterClick.emit();
  }
}