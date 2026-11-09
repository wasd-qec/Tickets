export type Role = 'CLIENT' | 'TECHNICIAN' | 'ADMIN'
export interface User {
    id: number
    username: string
    role: Role
    createdAt?: string
}