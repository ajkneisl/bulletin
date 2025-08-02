import { Block } from "./models/Block"
import { BASE_URL } from "./Util"
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
 * @param id The block to delete.
 */
export async function deleteBlock(id: string) {
    const url = new URL(`${BASE_URL}/blocks`)

    url.searchParams.set("id", id)

    const request = await fetch(url, {
        method: "DELETE"
    })

    if (!request.ok) {
        return Promise.reject("Failed to delete block.")
    }
}

export async function createBlock(
    type: string,
    content: string,
    file: File | null
): Promise<Block> {
    const formData = new FormData()

    formData.append("type", type)
    formData.append("content", content)

    if (file !== null) {
        formData.append("file", file)
    }

    const response = await fetch(`${BASE_URL}/blocks`, {
        method: "PUT",
        body: formData
    })

    if (!response.ok) {
        return Promise.reject("Failed to create block.")
    }

    return await response.json()
}
