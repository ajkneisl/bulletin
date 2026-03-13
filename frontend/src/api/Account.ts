import { BASE_URL } from "./Util"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

/**
 * Authorization token.
 */
export const authorizationToken = atomWithStorage<string | null>(
    "authorizationToken",
    null
)

/**
 * Username
 */
export const usernameAtom = atom<string | null>(null)

/**
 * Log in with a provided username and password.
 *
 * @param username User provided username.
 * @param password User provided password.
 */
export async function login(
    username: string,
    password: string
): Promise<string> {
    const request = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        body: new URLSearchParams({ username, password })
    })

    if (!request.ok) {
        return Promise.reject("Invalid username or password.")
    }

    const result = await request.json()

    return result.token
}

/**
 * Get the username by the provided token.
 *
 * This ensures that the token is valid.
 *
 * @param token The provided JWT.
 */
export async function getUsername(token: string): Promise<string | null> {
    try {
        const response = await fetch(`${BASE_URL}/account`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) return null

        const data = await response.json()
        return typeof data.username === "string" ? data.username : null
    } catch {
        return null
    }
}

/**
 * Get all accounts.
 *
 * @param token The authorization token.
 */
export async function getAllAccounts(token: string): Promise<string[]> {
    const response = await fetch(`${BASE_URL}/account?all`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        return Promise.reject("Failed to fetch accounts.")
    }

    const data: { username: string }[] = await response.json()
    return data.map((a) => a.username)
}

/**
 * Update the current user's username.
 *
 * @param token The authorization token.
 * @param newUsername The new username.
 */
export async function updateUsername(
    token: string,
    newUsername: string
): Promise<void> {
    const response = await fetch(`${BASE_URL}/account`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: new URLSearchParams({ newUsername })
    })

    if (!response.ok) {
        return Promise.reject("Failed to update username.")
    }
}

/**
 * Update a user's password.
 *
 * @param token The authorization token.
 * @param newPassword The new password.
 */
export async function updatePassword(
    token: string,
    newPassword: string
): Promise<void> {
    const response = await fetch(`${BASE_URL}/account`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: new URLSearchParams({ newPassword })
    })

    if (!response.ok) {
        return Promise.reject("Failed to update password.")
    }
}

/**
 * Delete the current user's account.
 *
 * @param token The authorization token.
 */
export async function deleteAccount(token: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/account`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        return Promise.reject("Failed to delete account.")
    }
}
