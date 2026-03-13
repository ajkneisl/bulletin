/**
 * A board.
 *
 * @param id The ID of the board.
 * @param name The name of the board.
 * @param description The description of the board.
 * @param author The username of the author of the board.
 * @param timestamp When the board was created.
 */
export interface Board {
    id: string
    name: string
    description: string
    author: string
    timestamp: number
}
