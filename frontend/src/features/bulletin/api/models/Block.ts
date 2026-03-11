export interface Block {
    id: string
    boardId: string
    x: number
    y: number
    width: number
    height: number
    type: "PHOTO" | "TEXT"
    content: string
    properties: Record<string, string>
}
