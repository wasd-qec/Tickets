import type { User } from "./User"
import type { Category } from './Categories'
export type Stage = 'Opened' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled'
export type Priority = 'Low' | 'Medium' | 'High'
export interface Tickets {
    Name: String
    TicketID: number
    CreateAt: string
    CreateBy: number
    Assignto?: number
    UpdatedAt: string
    Stage: Stage
    Priority: Priority
    CategoryID: number
}