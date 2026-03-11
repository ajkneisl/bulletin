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
