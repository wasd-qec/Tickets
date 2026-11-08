import type { Category, Comment, Ticket, User } from '@/types'

export const mockData: {
  users: User[]
  categories: Category[]
  tickets: Ticket[]
  comments: Comment[]
} = {
  "users": [
    {
      "id": 1,
      "username": "client",
      "role": "CLIENT",
      "createdAt": "2026-09-10T08:30:00.000Z"
    },
    {
      "id": 2,
      "username": "bob_client",
      "role": "CLIENT",
      "createdAt": "2026-09-14T11:15:00.000Z"
    },
    {
      "id": 3,
      "username": "tech",
      "role": "TECHNICIAN",
      "createdAt": "2026-08-20T09:00:00.000Z"
    },
    {
      "id": 4,
      "username": "dana_tech",
      "role": "TECHNICIAN",
      "createdAt": "2026-08-22T14:45:00.000Z"
    },
    {
      "id": 5,
      "username": "admim",
      "role": "ADMIN",
      "createdAt": "2026-08-01T08:00:00.000Z"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "Hardware",
      "description": "Laptops, monitors, keyboards, printers, and physical equipment issues.",
      "ticketCount": 2
    },
    {
      "id": 2,
      "name": "Software",
      "description": "Application crashes, license installations, and OS updates.",
      "ticketCount": 1
    },
    {
      "id": 3,
      "name": "Network & VPN",
      "description": "Wi-Fi connectivity, VPN access, firewall, and DNS issues.",
      "ticketCount": 1
    },
    {
      "id": 4,
      "name": "Account & Access",
      "description": "Password resets, MFA setup, permissions, and onboarding accounts.",
      "ticketCount": 0
    }
  ],
  "tickets": [
    {
      "id": 101,
      "title": "VPN disconnects every 15 minutes on macOS",
      "description": "Whenever I connect to the corporate VPN from home, the tunnel drops after roughly 15 minutes and requires re-authentication.",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "categoryId": 3,
      "category": {
        "id": 3,
        "name": "Network & VPN",
        "description": "Wi-Fi connectivity, VPN access, firewall, and DNS issues."
      },
      "authorId": 1,
      "author": {
        "id": 1,
        "username": "alice_client",
        "role": "CLIENT"
      },
      "assignedToId": 3,
      "assignedTo": {
        "id": 3,
        "username": "charlie_tech",
        "role": "TECHNICIAN"
      },
      "createdAt": "2026-11-06T09:20:00.000Z",
      "updatedAt": "2026-11-08T08:45:00.000Z"
    },
    {
      "id": 102,
      "title": "External monitor not detected via USB-C dock",
      "description": "My Dell 27-inch monitor stopped receiving signal through the docking station this morning.",
      "status": "OPEN",
      "priority": "MEDIUM",
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "Hardware",
        "description": "Laptops, monitors, keyboards, printers, and physical equipment issues."
      },
      "authorId": 1,
      "author": {
        "id": 1,
        "username": "alice_client",
        "role": "CLIENT"
      },
      "assignedToId": null,
      "assignedTo": null,
      "createdAt": "2026-11-07T14:10:00.000Z",
      "updatedAt": "2026-11-07T14:10:00.000Z"
    },
    {
      "id": 103,
      "title": "Requesting Figma desktop license for design review",
      "description": "Need edit permissions and the desktop client installed for the Q4 product sprint.",
      "status": "RESOLVED",
      "priority": "LOW",
      "categoryId": 2,
      "category": {
        "id": 2,
        "name": "Software",
        "description": "Application crashes, license installations, and OS updates."
      },
      "authorId": 2,
      "author": {
        "id": 2,
        "username": "bob_client",
        "role": "CLIENT"
      },
      "assignedToId": 4,
      "assignedTo": {
        "id": 4,
        "username": "dana_tech",
        "role": "TECHNICIAN"
      },
      "createdAt": "2026-11-04T10:00:00.000Z",
      "updatedAt": "2026-11-07T16:30:00.000Z"
    },
    {
      "id": 104,
      "title": "Replacement keyboard keycap broken",
      "description": "The spacebar stabilizer on my office mechanical keyboard snapped.",
      "status": "CLOSED",
      "priority": "LOW",
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "Hardware",
        "description": "Laptops, monitors, keyboards, printers, and physical equipment issues."
      },
      "authorId": 1,
      "author": {
        "id": 1,
        "username": "alice_client",
        "role": "CLIENT"
      },
      "assignedToId": 3,
      "assignedTo": {
        "id": 3,
        "username": "charlie_tech",
        "role": "TECHNICIAN"
      },
      "createdAt": "2026-10-28T13:00:00.000Z",
      "updatedAt": "2026-10-30T17:00:00.000Z"
    }
  ],
  "comments": [
    {
      "id": 1001,
      "ticketId": 101,
      "content": "Ticket claimed by charlie_tech",
      "isSystem": true,
      "createdAt": "2026-11-06T10:00:00.000Z"
    },
    {
      "id": 1002,
      "ticketId": 101,
      "content": "Hi Alice, could you check if you are on GlobalProtect version 6.2? We pushed a profile update yesterday.",
      "isSystem": false,
      "authorId": 3,
      "author": {
        "id": 3,
        "username": "charlie_tech",
        "role": "TECHNICIAN"
      },
      "createdAt": "2026-11-06T10:05:00.000Z"
    },
    {
      "id": 1003,
      "ticketId": 101,
      "content": "I am still on 6.1.4. Let me update and test for an hour.",
      "isSystem": false,
      "authorId": 1,
      "author": {
        "id": 1,
        "username": "alice_client",
        "role": "CLIENT"
      },
      "createdAt": "2026-11-06T11:12:00.000Z"
    },
    {
      "id": 1004,
      "ticketId": 101,
      "content": "Status changed from OPEN to IN_PROGRESS",
      "isSystem": true,
      "createdAt": "2026-11-08T08:45:00.000Z"
    }
  ]
}

