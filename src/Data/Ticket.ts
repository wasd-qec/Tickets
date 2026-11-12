import type { User } from "./User"
import type { Category } from './Categories'
export type Stage = 'Opened' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled'
export type Priority = 'Low' | 'Medium' | 'High'
export interface Tickets {
    id?: number | string
    Name: string
    Description?: string
    TicketID: number
    CreateAt: string
    CreateBy: number | string
    Assignto?: number | string
    UpdatedAt: string
    Stage: Stage
    Priority: Priority
    CategoryID: number
}
