import React, { useMemo, useState } from "react"
import clsx from "clsx"
import { Block } from "../api/models/Block"
import { useAtom } from "jotai"
import { editorMode } from "../../../api/Editor"
import { useImageBrightness } from "../../../hooks/useImageBrightness"
import {
    blocksAtom,
    deleteBlock,
    rotateBlock,
    photoVersionAtom,
    draggingIdAtom,
    resizingIdAtom,
    resizePreviewAtom,
    dragOffsetAtom
} from "../api/Blocks"
import { BASE_URL } from "../../../api/Util"
import { dimensionsAtom } from "../../../hooks/useDimensions"
import TextBlock from "./TextBlock"
import PhotoBlock from "./PhotoBlock"
import BlockControls from "./BlockControls"
import RotateOverlay from "./RotateOverlay"
import { authorizationToken } from "../../../api/Account"

export function BlockItem({ block }: { block: Block }) {
    const [token] = useAtom(authorizationToken)
    const [blocks, setBlocks] = useAtom(blocksAtom)
    const [editor] = useAtom(editorMode)
    const [{ COL_WIDTH, ROW_HEIGHT, COLS }] = useAtom(dimensionsAtom)
    const [, setPhotoVersions] = useAtom(photoVersionAtom)

    const [resizingId, setResizingId] = useAtom(resizingIdAtom)
    const [resizePreview, setResizePreview] = useAtom(resizePreviewAtom)
    const [, setDraggingId] = useAtom(draggingIdAtom)
    const [, setDragOffset] = useAtom(dragOffsetAtom)

    const isResizing = resizingId === block.id

    const { isDark, imgRef } = useImageBrightness(
        `${BASE_URL}/photos/${block.boardId}/${block.id}.png`
    )

    const [rotating, setRotating] = useState(false)
    const [rotationDegrees, setRotationDegrees] = useState(0)
    const [savingRotation, setSavingRotation] = useState(false)

    async function handleDelete() {
        await deleteBlock(token ?? "", block.id)
        setBlocks((prev) => prev.filter((b) => b.id !== block.id))
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

    function handleDragStart(e: React.MouseEvent) {
        setDraggingId(block.id)
        const rect = e.currentTarget.parentElement?.getBoundingClientRect()
        setDragOffset({
            x: e.clientX - (rect?.left ?? 0),
            y: e.clientY - (rect?.top ?? 0)
        })
    }

    const gridStyle = useMemo(() => {
        const newX = block.x % COLS
        const stackHeight = Math.max(...blocks.map((b) => b.y)) + 1
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

    const containerClass = useMemo(
        () =>
            clsx(
                "relative select-none overflow-hidden border border-black",
                "bg-gray-800 shadow-md",
                "transition-all duration-200 ease-in-out",
                block.type === "TEXT" && "p-2"
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
        <div
            id={`block-${block.id}`}
            className={containerClass}
            style={gridStyle}
        >
            <div
                className="relative size-full transition-[width,height] duration-300 ease-in-out"
                style={resizeStyle}
            >
                {block.type === "PHOTO" ? (
                    <PhotoBlock block={block} imgRef={imgRef} />
                ) : (
                    <TextBlock block={block} />
                )}

                {editor && (
                    <BlockControls
                        block={block}
                        isDark={isDark ?? false}
                        onDragStart={handleDragStart}
                        onResizeStart={() => {
                            setResizingId(block.id)
                            setResizePreview({
                                width: block.width,
                                height: block.height
                            })
                        }}
                        onRotateStart={() => {
                            setRotating(true)
                            setRotationDegrees(0)
                        }}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {rotating && (
                <RotateOverlay
                    block={block}
                    previewSize={COL_WIDTH * 3}
                    rotationDegrees={rotationDegrees}
                    saving={savingRotation}
                    onRotate={(delta) =>
                        setRotationDegrees((prev) => prev + delta)
                    }
                    onSave={handleSaveRotation}
                    onCancel={() => {
                        setRotating(false)
                        setRotationDegrees(0)
                    }}
                />
            )}
        </div>
    )
}
