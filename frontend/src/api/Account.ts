import { BASE_URL } from "./Util"

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
 * Update a user's password.
 *
 * @param token The authorization token.
 * @param newPassword The new password.
 */
export async function updatePassword(
    token: string,
    newPassword: string
): Promise<void> {
    try {
        const response = await fetch(`${BASE_URL}/account`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: new URLSearchParams({ newPassword })
        })

        if (!response.ok) {
            return Promise.reject("Invalid authorization!")
        }
    } catch {
        return Promise.reject("Invalid token!")
    }
}
