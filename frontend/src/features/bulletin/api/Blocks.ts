import { Block } from "./models/Block"
import { BASE_URL } from "../../../api/Util"
import { atom } from "jotai"

export const blocksAtom = atom<Block[]>([])

export const expandedBlockAtom = atom<string | null>(null)

/**
 * Retrieve a list of all blocks.
 */
export async function retrieveBlocks(): Promise<Block[]> {
    const request = await fetch(`${BASE_URL}/blocks`)

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
 * Shift all blocks down a certain amount.
 *
 * @param token Authorization token.
 * @param amount The amount to shift down.
 */
export async function shiftBlocks(token: string, amount: number) {
    const response = await fetch(`${BASE_URL}/blocks/shift`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: new URLSearchParams({ amount: `${amount}` })
    })

    if (!response.ok) return Promise.reject("Failed to shift blocks.")
}

/**
 * Create a block.
 *
 * @param token Authorization token.
 * @param type Type of block
 * @param content The contents of the block.
 * @param details Possible options of a block.
 * @param file A file, if type is a photo.
 */
export async function createBlock(
    token: string,
    type: string,
    content: string,
    details: Record<string, string>,
    file: File | null
): Promise<Block> {
    const formData = new FormData()

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
