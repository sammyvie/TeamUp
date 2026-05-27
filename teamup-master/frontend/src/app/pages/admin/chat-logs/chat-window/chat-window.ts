import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Party } from '../admin-chat-logs';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css'
})
export class ChatWindow {
  @Input() party?: Party;
}