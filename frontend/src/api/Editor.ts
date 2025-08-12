import { atomWithStorage } from "jotai/utils"
import { atom } from "jotai"

/**
 * If the is in editor mode.
 */
export const editorMode = atomWithStorage("editorMode", false)

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
 * Create block modal is open
 */
export const createBlockOpen = atom(false)

export const insertLinesOpen = atom(false)
