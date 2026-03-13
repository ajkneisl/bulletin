import { atom } from "jotai"

/**
 * If the client is in editor mode. This allows the editing of boards and blocks.
 */
export const editorMode = atom(false)

/**
 * Create block modal is open.
 */
export const createBlockOpen = atom(false)

/**
 * If the modal for inserting lines is open.
 */
export const insertLinesOpen = atom(false)
