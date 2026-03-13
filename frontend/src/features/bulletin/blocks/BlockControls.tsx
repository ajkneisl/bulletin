import React from "react"
import clsx from "clsx"
import { IoMdResize } from "react-icons/io"
import { MdDragHandle, MdEdit, MdRotateRight } from "react-icons/md"
import { IoTrash } from "react-icons/io5"
import { Block } from "../api/models/Block"

/**
 * {@link BlockControls}
 */
type Props = {
    block: Block
    isDark: boolean
    onDragStart: (e: React.MouseEvent) => void
    onResizeStart: () => void
    onRotateStart: () => void
    onDelete: () => void
}

/**
 * The controls for a block.
 *
 * @param block The block this control set belongs to.
 * @param isDark Whether the block's image is dark (used to pick text color).
 * @param onDragStart Called on mousedown to begin dragging.
 * @param onResizeStart Called on mousedown to begin resizing.
 * @param onRotateStart Called on click to open the rotate overlay.
 * @param onDelete Called on click to delete the block.
 */
export default function BlockControls({
    block,
    isDark,
    onDragStart,
    onResizeStart,
    onRotateStart,
    onDelete
}: Props) {
    const lightText = isDark || block.type === "TEXT"

    return (
        <>
            {/* Drag */}
            <div
                onMouseDown={onDragStart}
                className={clsx(
                    "absolute left-1 top-1 z-30 size-3 rounded-sm hover:cursor-pointer",
                    lightText ? "text-white" : "text-black"
                )}
            >
                <MdDragHandle />
            </div>

            {/* Edit */}
            <div
                onMouseDown={onDragStart}
                className={clsx(
                    "absolute right-2 top-1 size-3 rounded-sm hover:cursor-pointer",
                    lightText ? "text-white" : "text-black"
                )}
            >
                <MdEdit />
            </div>

            {/* Rotate for PHOTO */}
            {block.type === "PHOTO" && (
                <div
                    onClick={onRotateStart}
                    className={clsx(
                        "absolute left-5 top-1 z-30 size-3 cursor-pointer rounded-sm",
                        isDark ? "text-white" : "text-black"
                    )}
                >
                    <MdRotateRight />
                </div>
            )}

            {/* Resize */}
            <div
                data-resize
                onMouseDown={onResizeStart}
                className={clsx(
                    "absolute bottom-1 right-1 z-30 m-2 size-3 cursor-nwse-resize rounded-sm",
                    lightText ? "text-white" : "text-black"
                )}
            >
                <IoMdResize />
            </div>

            {/* Delete */}
            <div
                onClick={onDelete}
                className={clsx(
                    "absolute bottom-3 left-1 z-30 size-3 cursor-pointer rounded-sm",
                    lightText ? "text-white" : "text-black"
                )}
            >
                <IoTrash />
            </div>
        </>
    )
}
