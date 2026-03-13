/**
 * A block.
 *
 * @param id The unique ID of the block.
 * @param boardId The board that contains this block.
 * @param x The location on the board on the X-axis.
 * @param y The location on the board on the Y-axis.
 * @param width The width of the block.
 * @param height The height of the block.
 * @param type The type of the block.
 * @param content The content of the block.
 * @param properties Type specific properties of the block.
 */
export interface Block {
    id: string
    boardId: string
    x: number
    y: number
    width: number
    height: number
    type: BlockType
    content: string
    properties: Record<string, string>
}

/**
 * The type of Block in {@link Block}.
 *
 * This changes the `properties` of a {@link Block}.
 */
export type BlockType = "PHOTO" | "TEXT"
