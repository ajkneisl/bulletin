import { Block } from "./models/Block"
import { BASE_URL } from "../../../api/Util"
import { atom } from "jotai"

export const blocksAtom = atom<Block[]>([])

export const expandedBlockAtom = atom<string | null>(null)

/**
 * Retrieve blocks for a specific board.
 */
export async function retrieveBlocks(boardId: string): Promise<Block[]> {
    const url = new URL(`${BASE_URL}/blocks`)
    url.searchParams.set("boardId", boardId)

    const request = await fetch(url)

    return await request.json()
}

/**
 * Delete a block by it's ID.
 *
 * @param token Authorization token.
 * @param id The block to delete.
 */
export async function deleteBlock(token: string, id: string) {
    const url = new URL(`${BASE_URL}/blocks`)

    url.searchParams.set("id", id)

    const request = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!request.ok) {
        return Promise.reject("Failed to delete block.")
    }
}

/**
 * Shift all blocks in a board down a certain amount.
 *
 * @param token Authorization token.
 * @param boardId The board to shift blocks in.
 * @param amount The amount to shift down.
 */
export async function shiftBlocks(
    token: string,
    boardId: string,
    amount: number
) {
    const response = await fetch(`${BASE_URL}/blocks/shift`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: new URLSearchParams({ boardId, amount: `${amount}` })
    })

    if (!response.ok) return Promise.reject("Failed to shift blocks.")
}

/**
 * Create a block.
 *
 * @param token Authorization token.
 * @param boardId The board to create the block in.
 * @param type Type of block
 * @param content The contents of the block.
 * @param details Possible options of a block.
 * @param file A file, if type is a photo.
 */
export async function createBlock(
    token: string,
    boardId: string,
    type: string,
    content: string,
    details: Record<string, string>,
    file: File | null
): Promise<Block> {
    const formData = new FormData()

    formData.append("boardId", boardId)
    formData.append("type", type)
    formData.append("content", content)
    formData.append("options", JSON.stringify(details))

    if (file !== null) {
        formData.append("file", file)
    }

    const response = await fetch(`${BASE_URL}/blocks`, {
        method: "PUT",
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        return Promise.reject("Failed to create block.")
    }

    return await response.json()
}
