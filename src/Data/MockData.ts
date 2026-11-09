import type { User } from './User'
import type { Category } from './Categories'
import type { Tickets } from './Ticket'
import type { Comment } from './Comment'

export const mockUsers: User[] = [
    { id: 1, username: 'alice_client', role: 'CLIENT' },
    { id: 2, username: 'charlie_tech', role: 'TECHNICIAN' },
    { id: 3, username: 'admin_user', role: 'ADMIN' },
]

export const mockCategories: Category[] = [
    { name: 'Hardware', Description: 'Physical equipment issues', CategroyID: 1 },
    { name: 'Software', Description: 'Applications and OS', CategroyID: 2 },
]

export const mockTickets: Tickets[] = [
    {
        TicketID: 101,
        Name: 'Monitor not working',
        CreateAt: '2026-11-08T08:00:00.000Z',
        CreateBy: 1,
        UpdatedAt: '2026-11-08T08:00:00.000Z',
        Stage: 'Opened',
        Priority: 'Medium',
        CategoryID: 1,
    },
]

export const mockComments: Comment[] = [
    {
        CommentID: 1,
        TicketID: 101,
        AuthorID: 2,
        SystemMessage: false,
        Message: 'Looking into this now.',
        creatAt: '2026-11-08T09:00:00.000Z',
    },
]