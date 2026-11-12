export type Role = 'CLIENT' | 'TECHNICIAN' | 'ADMIN'
export interface User {
    id: number | string
    username: string
    role: Role
    createdAt?: string
}
