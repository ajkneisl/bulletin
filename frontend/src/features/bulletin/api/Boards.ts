import { Board } from "./models/Board"
import { BASE_URL } from "../../../api/Util"
import { atom } from "jotai"

export const boardsAtom = atom<Board[]>([])
export const selectedBoardAtom = atom<Board | null>(null)

/** Retrieve all boards, sorted newest first. */
export async function retrieveBoards(): Promise<Board[]> {
    const request = await fetch(`${BASE_URL}/boards`)
    return await request.json()
}

/** Create a new board. */
export async function createBoard(
    token: string,
    name: string,
    description: string
): Promise<Board> {
    const response = await fetch(`${BASE_URL}/boards`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ name, description })
    })

    if (!response.ok) {
        return Promise.reject("Failed to create board.")
    }

    return await response.json()
}

/** Update a board's name, description, or date. */
export async function updateBoard(
    token: string,
    boardId: string,
    fields: { name?: string; description?: string; timestamp?: number }
): Promise<Board> {
    const params = new URLSearchParams()
    if (fields.name !== undefined) params.set("name", fields.name)
    if (fields.description !== undefined) params.set("description", fields.description)
    if (fields.timestamp !== undefined) params.set("timestamp", fields.timestamp.toString())

    const response = await fetch(`${BASE_URL}/boards/${boardId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    })

    if (!response.ok) {
        return Promise.reject("Failed to update board.")
    }

    return await response.json()
}

/** Delete a board. */
export async function deleteBoard(
    token: string,
    boardId: string
): Promise<void> {
    const response = await fetch(`${BASE_URL}/boards/${boardId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        return Promise.reject("Failed to delete board.")
    }
}
