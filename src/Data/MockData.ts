import { reactive } from 'vue'
import type { User } from './User'
import type { Category } from './Categories'
import type { Tickets } from './Ticket'
import type { Comment } from './Comment'

export const mockUsers = reactive<User[]>([
  { id: 1, username: 'alice_client', role: 'CLIENT', createdAt: '2026-09-10T08:30:00.000Z' },
  { id: 2, username: 'bob_client', role: 'CLIENT', createdAt: '2026-09-14T11:15:00.000Z' },
  { id: 3, username: 'charlie_tech', role: 'TECHNICIAN', createdAt: '2026-08-20T09:00:00.000Z' },
  { id: 4, username: 'dana_tech', role: 'TECHNICIAN', createdAt: '2026-08-22T14:45:00.000Z' },
  { id: 5, username: 'admin_user', role: 'ADMIN', createdAt: '2026-08-01T08:00:00.000Z' },
])

export const mockCategories = reactive<Category[]>([
  { CategroyID: 1, name: 'Hardware', Description: 'Laptops, monitors, keyboards, printers, and physical equipment issues.' },
  { CategroyID: 2, name: 'Software', Description: 'Application crashes, license installations, and OS updates.' },
  { CategroyID: 3, name: 'Network & VPN', Description: 'Wi-Fi connectivity, VPN access, firewall, and DNS issues.' },
  { CategroyID: 4, name: 'Account & Access', Description: 'Password resets, MFA setup, permissions, and onboarding accounts.' },
])

export const mockTickets = reactive<Tickets[]>([
  {
    TicketID: 101,
    Name: 'VPN disconnects every 15 minutes on macOS',
    Description: 'Whenever I connect to the corporate VPN from home, the tunnel drops after roughly 15 minutes and requires re-authentication.',
    CreateAt: '2026-11-06T09:20:00.000Z',
    CreateBy: 1,
    Assignto: 3,
    UpdatedAt: '2026-11-08T08:45:00.000Z',
    Stage: 'In Progress',
    Priority: 'High',
    CategoryID: 3,
  },
  {
    TicketID: 102,
    Name: 'External monitor not detected via USB-C dock',
    Description: 'My Dell 27-inch monitor stopped receiving signal through the docking station this morning.',
    CreateAt: '2026-11-07T14:10:00.000Z',
    CreateBy: 1,
    UpdatedAt: '2026-11-07T14:10:00.000Z',
    Stage: 'Opened',
    Priority: 'Medium',
    CategoryID: 1,
  },
  {
    TicketID: 103,
    Name: 'Requesting Figma desktop license for design review',
    Description: 'Need edit permissions and the desktop client installed for the Q4 product sprint.',
    CreateAt: '2026-11-04T10:00:00.000Z',
    CreateBy: 2,
    Assignto: 4,
    UpdatedAt: '2026-11-07T16:30:00.000Z',
    Stage: 'Resolved',
    Priority: 'Low',
    CategoryID: 2,
  },
  {
    TicketID: 104,
    Name: 'Replacement keyboard keycap broken',
    Description: 'The spacebar stabilizer on my office mechanical keyboard snapped.',
    CreateAt: '2026-10-28T13:00:00.000Z',
    CreateBy: 1,
    Assignto: 3,
    UpdatedAt: '2026-10-30T17:00:00.000Z',
    Stage: 'Closed',
    Priority: 'Low',
    CategoryID: 1,
  },
])

export const mockComments = reactive<Comment[]>([
  {
    CommentID: 1,
    TicketID: 101,
    AuthorID: 3,
    SystemMessage: true,
    Message: 'Ticket claimed by charlie_tech',
    creatAt: '2026-11-06T10:00:00.000Z',
  },
  {
    CommentID: 2,
    TicketID: 101,
    AuthorID: 3,
    SystemMessage: false,
    Message: 'Hi Alice, could you check if you are on GlobalProtect version 6.2? We pushed a profile update yesterday.',
    creatAt: '2026-11-06T10:05:00.000Z',
  },
  {
    CommentID: 3,
    TicketID: 101,
    AuthorID: 1,
    SystemMessage: false,
    Message: 'I am still on 6.1.4. Let me update and test for an hour.',
    creatAt: '2026-11-06T11:12:00.000Z',
  },
  {
    CommentID: 4,
    TicketID: 101,
    AuthorID: 3,
    SystemMessage: true,
    Message: 'Status changed from Opened to In Progress',
    creatAt: '2026-11-08T08:45:00.000Z',
  },
])
