import { AdminBackground } from '../admin-background';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../../../components/admin-header/admin-header';
import { PartyList } from './party-list/party-list';
import { ChatWindow } from './chat-window/chat-window';
import { Footer } from '../../../components/footer/footer';

export interface Message {
  sender: string;
  avatar: string;
  text: string;
  time: string;
}

export interface Party {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timeAgo: string;
  members: string;
  dateLabel: string;
  messages: Message[];
}

@Component({
  selector: 'app-admin-chat-logs',
  imports: [AdminBackground, CommonModule, AdminSidebar, AdminHeader, PartyList, ChatWindow, Footer],
  templateUrl: './admin-chat-logs.html',
  styleUrl: './admin-chat-logs.css'
})
export class AdminChatLogs {

  parties: Party[] = [
    {
      id: 12, name: 'Party #12', avatar: '👥', timeAgo: '2 mins ago',
      lastMessage: "Let's start on the backend...",
      members: 'John Doe, Jane Smith, David Williams',
      dateLabel: 'Today',
      messages: [
        { sender: 'John Doe',       avatar: 'JD', text: "Lets' start on the backend integration task today.",                                      time: '10:15 AM' },
        { sender: 'Jane Smith',     avatar: 'JS', text: "Sure! I'll set up the database connection and start working on the API endpoints",         time: '10:16 AM' },
        { sender: 'David Williams', avatar: 'DW', text: 'Great! I will be working on the frontend enhancements while you guys handle the backend',  time: '10:18 AM' },
      ]
    },
    {
      id: 2, name: 'Party #2', avatar: '👥', timeAgo: '10 mins ago',
      lastMessage: 'Working on the dashboard...',
      members: 'Alice Cooper, Rachel Brewer, Michael Clarke',
      dateLabel: 'Today',
      messages: [
        { sender: 'Alice Cooper',   avatar: 'AC', text: 'Working on the dashboard layout now.',  time: '9:50 AM' },
        { sender: 'Rachel Brewer',  avatar: 'RB', text: 'Let me know if you need any assets.',   time: '9:55 AM' },
        { sender: 'Michael Clarke', avatar: 'MC', text: 'I can help with the data tables too.',  time: '9:58 AM' },
      ]
    },
    {
      id: 5, name: 'Party #5', avatar: '👥', timeAgo: '1 hour ago',
      lastMessage: 'Any update on the landing...',
      members: 'Jeff Johnson, Sarah Brown, Carlos Rivera',
      dateLabel: 'Today',
      messages: [
        { sender: 'Jeff Johnson',  avatar: 'JJ', text: 'Any update on the landing page?',         time: '9:00 AM' },
        { sender: 'Sarah Brown',   avatar: 'SB', text: 'Almost done, just fixing some styles.',   time: '9:05 AM' },
        { sender: 'Carlos Rivera', avatar: 'CR', text: 'I can do a quick review once its ready.', time: '9:08 AM' },
      ]
    },
    {
      id: 11, name: 'Party #11', avatar: '👥', timeAgo: '5 hours ago',
      lastMessage: 'Reviewed the security audit...',
      members: 'Emily Tran, Marcus Lee, Nina Patel',
      dateLabel: 'Today',
      messages: [
        { sender: 'Emily Tran', avatar: 'ET', text: 'Reviewed the security audit report.',   time: '5:00 AM' },
        { sender: 'Marcus Lee', avatar: 'ML', text: 'Good catch, I will fix those issues.',  time: '5:10 AM' },
        { sender: 'Nina Patel', avatar: 'NP', text: 'Let me know if you need help testing.', time: '5:15 AM' },
      ]
    },
    {
      id: 7, name: 'Party #7', avatar: '👥', timeAgo: '1 day ago',
      lastMessage: 'Task 3 is almost complete!',
      members: 'Leo Santos, Mia Nguyen, Omar Hassan',
      dateLabel: 'Yesterday',
      messages: [
        { sender: 'Leo Santos',  avatar: 'LS', text: 'Task 3 is almost complete!',          time: '3:22 PM' },
        { sender: 'Mia Nguyen',  avatar: 'MN', text: 'Great work! Let us know when done.',  time: '3:45 PM' },
        { sender: 'Omar Hassan', avatar: 'OH', text: 'I will handle the final QA check.',   time: '4:10 PM' },
      ]
    },
    {
      id: 9, name: 'Party #9', avatar: '👥', timeAgo: '2 days ago',
      lastMessage: 'Remember to add the authen...',
      members: 'Priya Sharma, Ethan Brooks, Lena Fischer',
      dateLabel: '2 Days Ago',
      messages: [
        { sender: 'Priya Sharma', avatar: 'PS', text: 'Remember to add the authentication middleware.', time: '11:30 AM' },
        { sender: 'Ethan Brooks', avatar: 'EB', text: 'Already on it, almost finished.',               time: '11:45 AM' },
        { sender: 'Lena Fischer', avatar: 'LF', text: 'Let me know if you need the API docs.',         time: '12:00 PM' },
      ]
    },
  ];

  selectedParty: Party = this.parties[0];

  onPartySelect(party: Party): void {
    this.selectedParty = party;
  }
}