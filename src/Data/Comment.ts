export interface Comment {
    id?: number | string
    CommentID?: number
    creatAt: string
    AuthorID?: number | string
    CreateBy?: number | string
    SystemMessage: boolean
    Message: string
    TicketID: number | string
}
