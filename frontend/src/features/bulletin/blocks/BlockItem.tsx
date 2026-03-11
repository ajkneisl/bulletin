import React, { useMemo, useState } from "react"
import clsx from "clsx"
import { Block } from "../api/models/Block"
import { useAtom } from "jotai"
import { authorizationToken, editorMode } from "../../../api/Editor"
import { IoMdResize } from "react-icons/io"
import { MdDragHandle, MdEdit, MdRotateLeft, MdRotateRight } from "react-icons/md"
import { useImageBrightness } from "../../../hooks/useImageBrightness"
import { IoTrash } from "react-icons/io5"
import { blocksAtom, deleteBlock, rotateBlock, photoVersionAtom } from "../api/Blocks"
import { BASE_URL } from "../../../api/Util"
import { dimensionsAtom } from "../../../hooks/useDimensions"
import TextBlock from "./TextBlock"
import PhotoBlock from "./PhotoBlock"

type Props = {
    block: Block
    resizingId: string | null
    resizePreview: { width: number; height: number } | null
    draggingId: string | null
    dragOffset: { x: number; y: number }
    setDraggingId: (id: string | null) => void
    setResizingId: (id: string | null) => void
    setResizePreview: (
        preview: { width: number; height: number } | null
    ) => void
    offsetRef: React.MutableRefObject<{ x: number; y: number }>
}

export function BlockItem({
    block,
    resizingId,
    resizePreview,
    draggingId,
    setDraggingId,
    setResizingId,
    setResizePreview,
    offsetRef
}: Props) {
    const isResizing = resizingId === block.id
    const isDragging = draggingId === block.id

    const [token] = useAtom(authorizationToken)

    const [blocks, setBlocks] = useAtom(blocksAtom)
    const [editor] = useAtom(editorMode)
    const [{ COL_WIDTH, ROW_HEIGHT, COLS }] = useAtom(dimensionsAtom)
    const [, setPhotoVersions] = useAtom(photoVersionAtom)
    const { isDark, imgRef } = useImageBrightness(
        `${BASE_URL}/photos/${block.boardId}/${block.id}.png`
    )

    const [rotating, setRotating] = useState(false)
    const [rotationDegrees, setRotationDegrees] = useState(0)
    const [savingRotation, setSavingRotation] = useState(false)

    /**
     * Deletes this block.
     */
    async function remove() {
        await deleteBlock(token ?? "", block.id)

        setBlocks((prev) =>
            prev.filter((filterBlock) => filterBlock.id !== block.id)
        )
    }

    async function handleSaveRotation() {
        const normalized = ((rotationDegrees % 360) + 360) % 360
        if (normalized === 0) {
            setRotating(false)
            return
        }
        try {
            setSavingRotation(true)
            await rotateBlock(token ?? "", block.id, normalized)
            setPhotoVersions((prev) => ({ ...prev, [block.id]: Date.now() }))
            setRotating(false)
            setRotationDegrees(0)
        } finally {
            setSavingRotation(false)
        }
    }

    // style
    const style = useMemo(() => {
        // transform the x and y depending on screen size
        const newX = block.x % COLS
        const stackHeight = Math.max(...blocks.map((block) => block.y)) + 1
        const stackOffset = Math.floor(block.x / COLS) * stackHeight
        const newY = block.y + stackOffset

        const visibleWidth =
            isResizing && resizePreview ? resizePreview.width : block.width
        const visibleHeight =
            isResizing && resizePreview ? resizePreview.height : block.height

        return {
            gridColumnStart: newX + 1,
            gridRowStart: newY + 1,
            gridColumnEnd: `span ${visibleWidth}`,
            gridRowEnd: `span ${visibleHeight}`
        }
    }, [
        COLS,
        block.height,
        block.width,
        block.x,
        block.y,
        blocks,
        isResizing,
        resizePreview
    ])

    const className = useMemo(
        () =>
            clsx(
                "relative select-none overflow-hidden border border-black",
                "bg-gray-800 shadow-md",
                "transition-all duration-200 ease-in-out",
                block.type === "TEXT" ? "p-2" : ""
            ),
        [block.type]
    )

    const resizeStyle = useMemo(() => {
        const resizing = isResizing && resizePreview

        return {
            width: resizing ? resizePreview.width * COL_WIDTH : "100%",
            height: resizing ? resizePreview.height * ROW_HEIGHT : "100%"
        }
    }, [COL_WIDTH, ROW_HEIGHT, isResizing, resizePreview])

    return (
        <div id={`block-${block.id}`} className={className} style={style}>
            <div
                className={clsx(
                    "relative size-full transition-[width,height] duration-300 ease-in-out",
                    block.type === "TEXT" ? "" : ""
                )}
                style={resizeStyle}
            >
                {block.type === "PHOTO" ? (
                    <PhotoBlock block={block} imgRef={imgRef} />
                ) : (
                    <TextBlock block={block} />
                )}

                {editor && (
                    <>
                        {/* Drag */}
                        <div
                            onMouseDown={(e) => {
                                setDraggingId(block.id)

                                const rect =
                                    e.currentTarget.parentElement?.getBoundingClientRect()

                                offsetRef.current = {
                                    x: e.clientX - (rect?.left ?? 0),
                                    y: e.clientY - (rect?.top ?? 0)
                                }
                            }}
                            className={clsx(
                                "absolute left-1 top-1 z-30 size-3 rounded-sm hover:cursor-pointer",
                                isDark || block.type === "TEXT"
                                    ? "text-white"
                                    : "text-black"
                            )}
                        >
                            <MdDragHandle />
                        </div>

                        {/* Edit */}
                        <div
                            onMouseDown={(e) => {
                                setDraggingId(block.id)
                                const rect =
                                    e.currentTarget.parentElement?.getBoundingClientRect()

                                offsetRef.current = {
                                    x: e.clientX - (rect?.left ?? 0),
                                    y: e.clientY - (rect?.top ?? 0)
                                }
                            }}
                            className={clsx(
                                "absolute right-2 top-1 size-3 rounded-sm hover:cursor-pointer",
                                isDark || block.type === "TEXT"
                                    ? "text-white"
                                    : "text-black"
                            )}
                        >
                            <MdEdit />
                        </div>

                        {/* Rotate (photo only) */}
                        {block.type === "PHOTO" && (
                            <div
                                onClick={() => {
                                    setRotating(true)
                                    setRotationDegrees(0)
                                }}
                                className={clsx(
                                    "absolute left-5 top-1 z-30 size-3 cursor-pointer rounded-sm",
                                    isDark
                                        ? "text-white"
                                        : "text-black"
                                )}
                            >
                                <MdRotateRight />
                            </div>
                        )}

                        {/* Resize */}
                        <div
                            data-resize
                            onMouseDown={() => {
                                setResizingId(block.id)
                                setResizePreview({
                                    width: block.width,
                                    height: block.height
                                })
                            }}
                            className={clsx(
                                "absolute bottom-1 right-1 z-30 m-2 size-3 cursor-nwse-resize rounded-sm",
                                isDark || block.type === "TEXT"
                                    ? "text-white"
                                    : "text-black"
                            )}
                        >
                            <IoMdResize />
                        </div>

                        {/* Resize */}
                        <div
                            onClick={remove}
                            className={clsx(
                                "z-30 absolute bottom-3 left-1 size-3 cursor-pointer rounded-sm",
                                isDark || block.type === "TEXT"
                                    ? "text-white"
                                    : "text-black"
                            )}
                        >
                            <IoTrash />
                        </div>
                    </>
                )}
            </div>

            {/* Rotate overlay */}
            {rotating && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                        onClick={() => {
                            setRotating(false)
                            setRotationDegrees(0)
                        }}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
                            <h2 className="text-lg font-semibold text-neutral-100">
                                Rotate Image
                            </h2>
                            <div
                                className="overflow-hidden rounded-xl"
                                style={{
                                    width: COL_WIDTH * 3,
                                    height: COL_WIDTH * 3
                                }}
                            >
                                <img
                                    src={`${BASE_URL}/photos/${block.boardId}/${block.id}.png?quality=FULL`}
                                    className="size-full object-cover transition-transform duration-300"
                                    style={{
                                        transform: `rotate(${rotationDegrees}deg)`
                                    }}
                                    alt={block.content}
                                />
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() =>
                                        setRotationDegrees(
                                            (prev) => prev - 90
                                        )
                                    }
                                    className="flex items-center gap-1 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-200 hover:bg-neutral-750"
                                >
                                    <MdRotateLeft className="size-5" />
                                </button>
                                <span className="text-sm text-neutral-400">
                                    {((rotationDegrees % 360) + 360) % 360}°
                                </span>
                                <button
                                    onClick={() =>
                                        setRotationDegrees(
                                            (prev) => prev + 90
                                        )
                                    }
                                    className="flex items-center gap-1 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-200 hover:bg-neutral-750"
                                >
                                    <MdRotateRight className="size-5" />
                                </button>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setRotating(false)
                                        setRotationDegrees(0)
                                    }}
                                    className="rounded-xl border border-neutral-700 bg-neutral-850 px-4 py-2 text-neutral-200 hover:bg-neutral-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveRotation}
                                    disabled={savingRotation}
                                    className={clsx(
                                        "flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-600",
                                        savingRotation
                                            ? "cursor-not-allowed bg-emerald-700 opacity-75"
                                            : "bg-emerald-600 hover:bg-emerald-700"
                                    )}
                                >
                                    {savingRotation && (
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                    )}
                                    {savingRotation ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
