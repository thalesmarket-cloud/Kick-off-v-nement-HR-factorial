/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Status = 'Not started' | 'In progress' | 'Done';

export interface ChecklistItem {
  id: string;
  section: string;
  text: string;
  completed: boolean;
  owner?: string;
  status: Status;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  status: Status;
}

export interface Decision {
  id: string;
  text: string;
  responsible?: string;
  type: 'Decision' | 'Next Step';
}

export interface MeetingInfo {
  title: string;
  date: string;
  time: string;
  location: string;
}

export interface AppState {
  meetingInfo: MeetingInfo;
  checklist: ChecklistItem[];
  tasks: Task[];
  notes: string;
  decisions: Decision[];
}

export const INITIAL_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { section: 'Strategy', text: 'Define event objectives', completed: false, status: 'Not started' },
  { section: 'Strategy', text: 'Identify target audience', completed: false, status: 'Not started' },
  { section: 'Strategy', text: 'Draft core message', completed: false, status: 'Not started' },
  
  { section: 'Logistics', text: 'Confirm venue booking', completed: false, status: 'Not started' },
  { section: 'Logistics', text: 'Set event date and time', completed: false, status: 'Not started' },
  { section: 'Logistics', text: 'Plan room layout/setup', completed: false, status: 'Not started' },
  
  { section: 'Communication', text: 'Draft invitation emails', completed: false, status: 'Not started' },
  { section: 'Communication', text: 'Create social media posts', completed: false, status: 'Not started' },
  { section: 'Communication', text: 'Send initial invitations', completed: false, status: 'Not started' },
  
  { section: 'Speakers & Content', text: 'Finalize speaker list', completed: false, status: 'Not started' },
  { section: 'Speakers & Content', text: 'Review presentation slides', completed: false, status: 'Not started' },
  
  { section: 'Budget', text: 'Approve overall budget', completed: false, status: 'Not started' },
  { section: 'Budget', text: 'Track vendor payments', completed: false, status: 'Not started' },
  
  { section: 'Technical setup', text: 'Test AV equipment', completed: false, status: 'Not started' },
  { section: 'Technical setup', text: 'Setup registration system', completed: false, status: 'Not started' },
];

export const MILESTONES = [
  { label: 'J-30', description: 'Strategy & Venue' },
  { label: 'J-15', description: 'Communication & Speakers' },
  { label: 'J-7', description: 'Final Logistics' },
  { label: 'J-1', description: 'Technical Run-through' },
  { label: 'Event Day', description: 'Execution' },
];
