import React, { useMemo } from "react"
import clsx from "clsx"
import { Block } from "../api/models/Block"
import { useAtom } from "jotai"
import { authorizationToken, editorMode } from "../../../api/Editor"
import { IoMdResize } from "react-icons/io"
import { MdDragHandle, MdEdit } from "react-icons/md"
import { useImageBrightness } from "../../../hooks/useImageBrightness"
import { IoTrash } from "react-icons/io5"
import { blocksAtom, deleteBlock, expandedBlockAtom } from "../api/Blocks"
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
    const [expandedBlock, setExpandedBlock] = useAtom(expandedBlockAtom)

    const { isDark, imgRef } = useImageBrightness(
        `${BASE_URL}/photos/${block.id}.png`
    )

    const isExpanded = useMemo(
        () => expandedBlock === block.id,
        [block.id, expandedBlock]
    )

    /**
     * Deletes this block.
     */
    async function remove() {
        await deleteBlock(token ?? "", block.id)

        setBlocks((prev) =>
            prev.filter((filterBlock) => filterBlock.id !== block.id)
        )
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
            gridColumnEnd: `span ${
                isExpanded ? visibleWidth + 1 : visibleWidth
            }`,
            gridRowEnd: `span ${isExpanded ? visibleHeight + 1 : visibleHeight}`
        }
    }, [
        COLS,
        block.height,
        block.width,
        block.x,
        block.y,
        blocks,
        isExpanded,
        isResizing,
        resizePreview
    ])

    const className = useMemo(
        () =>
            clsx(
                "relative select-none overflow-hidden border border-black",
                "bg-gray-800 shadow-md",
                "transition-all duration-200 ease-in-out",
                isExpanded ? "z-50" : "z-0",
                block.type === "TEXT" ? "p-2" : ""
            ),
        [isExpanded, block.type]
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
        </div>
    )
}
