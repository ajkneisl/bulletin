import React, { useEffect, useMemo, useRef, useState } from "react"
import { BlockItem } from "./blocks/BlockItem"
import { blocksAtom, retrieveBlocks } from "./api/Blocks"
import { useAtom } from "jotai"
import clsx from "clsx"
import { BASE_URL } from "../../api/Util"
import { dimensionsAtom } from "../../hooks/useDimensions"
import { authorizationToken } from "../../api/Editor"

/**
 * The primary bulletin board.
 * @constructor
 */
export default function Bulletin() {
    const [blocks, setBlocks] = useAtom(blocksAtom)
    const [token] = useAtom(authorizationToken)

    const [{ COLS, ROWS, COL_WIDTH, ROW_HEIGHT, MAX_WIDTH, MAX_HEIGHT }] =
        useAtom(dimensionsAtom)

    useEffect(() => {
        retrieveBlocks().then((retrievedBlocks) => setBlocks(retrievedBlocks))
    }, [setBlocks])

    const [resizingId, setResizingId] = useState<string | null>(null)
    const [resizePreview, setResizePreview] = useState<{
        width: number
        height: number
    } | null>(null)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0
    })
    const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

    useEffect(() => {
        function resizeBlock(id: string, width: number, height: number) {
            const block = blocks.find((b) => b.id === id)
            if (!block) return

            const formData = new FormData()

            formData.append("id", id)
            formData.append("name", "size")
            formData.append("value", `${width}/${height}`)

            fetch(`${BASE_URL}/blocks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(formData as any)
            }).catch(console.error)
        }

        function onMouseMove(e: MouseEvent) {
            if (!resizingId) return
            const block = blocks.find((b) => b.id === resizingId)
            if (!block) return

            const rect = document
                .getElementById(`block-${block.id}`)
                ?.getBoundingClientRect()
            if (!rect) return

            const newWidth = Math.min(
                MAX_WIDTH,
                Math.max(1, Math.round((e.clientX - rect.left) / COL_WIDTH))
            )
            const newHeight = Math.min(
                MAX_HEIGHT,
                Math.max(1, Math.round((e.clientY - rect.top) / ROW_HEIGHT))
            )

            setResizePreview({ width: newWidth, height: newHeight })
        }

        function onMouseUp() {
            if (resizingId && resizePreview) {
                setBlocks((prev) =>
                    prev.map((b) =>
                        b.id === resizingId
                            ? {
                                  ...b,
                                  width: resizePreview.width,
                                  height: resizePreview.height
                              }
                            : b
                    )
                )
                resizeBlock(
                    resizingId,
                    resizePreview.width,
                    resizePreview.height
                )
            }
            setResizingId(null)
            setResizePreview(null)
        }

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
        return () => {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }
    }, [
        resizingId,
        resizePreview,
        blocks,
        MAX_WIDTH,
        COL_WIDTH,
        MAX_HEIGHT,
        ROW_HEIGHT,
        setBlocks
    ])

    useEffect(() => {
        function moveBlock(id: string) {
            const block = blocks.find((b) => b.id === id)
            if (!block) return

            const formData = new FormData()

            formData.append("id", id)
            formData.append("name", "position")
            formData.append("value", `${block.x}/${block.y}`)

            fetch(`${BASE_URL}/blocks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(formData as any)
            }).catch(console.error)
        }

        function onMouseMove(e: MouseEvent) {
            if (!draggingId) return
            const offset = offsetRef.current
            const gridRect = document
                .getElementById("grid")
                ?.getBoundingClientRect()
            if (!gridRect) return

            const x = Math.min(
                COLS - 1,
                Math.max(
                    0,
                    Math.round(
                        (e.clientX - gridRect.left - offset.x) / COL_WIDTH
                    )
                )
            )
            const y = Math.min(
                ROWS - 1,
                Math.max(
                    0,
                    Math.round(
                        (e.clientY - gridRect.top - offset.y) / ROW_HEIGHT
                    )
                )
            )

            setDragOffset({ x, y })

            setBlocks((prev) =>
                prev.map((b) => (b.id === draggingId ? { ...b, x, y } : b))
            )
        }

        function onMouseUp() {
            if (draggingId) moveBlock(draggingId)
            setDraggingId(null)
        }

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
        return () => {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }
    }, [
        COLS,
        COL_WIDTH,
        ROWS,
        ROW_HEIGHT,
        blocks,
        draggingId,
        setBlocks,
        token
    ])

    // grid size depending on screen size
    const style = useMemo(() => {
        return {
            gridTemplateRows: `repeat(${ROWS}, ${ROW_HEIGHT}px)`,
            gridTemplateColumns: `repeat(${COLS}, ${COL_WIDTH}px)`
        }
    }, [ROWS, ROW_HEIGHT, COLS, COL_WIDTH])

    return (
        <div id="grid" className={clsx("mx-auto mt-8 grid")} style={style}>
            {blocks.map((block) => (
                <BlockItem
                    key={block.id}
                    block={block}
                    resizingId={resizingId}
                    resizePreview={resizePreview}
                    draggingId={draggingId}
                    dragOffset={dragOffset}
                    setDraggingId={setDraggingId}
                    setResizingId={setResizingId}
                    setResizePreview={setResizePreview}
                    offsetRef={offsetRef}
                />
            ))}
        </div>
    )
}
