import clsx from "clsx"
import { BASE_URL } from "../../../api/Util"
import React, { useCallback, useEffect, useMemo } from "react"
import { Block } from "../api/models/Block"
import { useAtom } from "jotai"
import { editorMode } from "../../../api/Editor"
import { expandedBlockAtom } from "../api/Blocks"
import { dimensionsAtom } from "../../../hooks/useDimensions"

/**
 * A photo block.
 *
 * @param block The block itself.
 * @param imgRef Ref for the image to detect if it's dark or not.
 * @constructor
 */
export default function PhotoBlock({
    block,
    imgRef
}: {
    block: Block
    imgRef: React.RefObject<HTMLImageElement>
}) {
    const [editor] = useAtom(editorMode)
    const [expandedBlock, setExpandedBlock] = useAtom(expandedBlockAtom)
    const [{ COL_WIDTH, ROW_HEIGHT }] = useAtom(dimensionsAtom)

    const isExpanded = useMemo(
        () => expandedBlock === block.id,
        [block.id, expandedBlock]
    )

    function expand() {
        if (editor) return
        setExpandedBlock((prev) => (prev === block.id ? null : block.id))
    }

    const collapse = useCallback(() => {
        setExpandedBlock(null)
    }, [setExpandedBlock])

    // close on escape
    useEffect(() => {
        if (!isExpanded) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") collapse()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isExpanded, collapse])

    const overlaySize = COL_WIDTH * 3

    return (
        <>
            <div
                className={clsx(
                    "group size-full cursor-pointer transition-all duration-300"
                )}
                onClick={expand}
            >
                <img
                    ref={imgRef}
                    onDragStart={(e) => e.preventDefault()}
                    src={`${BASE_URL}/photos/${block.boardId}/${block.id}.png`}
                    className={clsx(
                        "size-full object-cover",
                        editor ? "pointer-events-none" : ""
                    )}
                    alt={block.content}
                />

                {/* hover caption */}
                {!editor && (
                    <div
                        className={clsx(
                            "absolute inset-x-0 bottom-0 z-10 bg-black/60 text-white",
                            "translate-y-full group-hover:translate-y-0",
                            "transition-transform duration-300 ease-in-out"
                        )}
                    >
                        <div className="p-2 text-sm">
                            <p className="mb-1 line-clamp-2">{block.content}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* expanded overlay */}
            {isExpanded && !editor && (
                <>
                    {/* backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/70"
                        onClick={collapse}
                    />

                    {/* centered 3x3 image */}
                    <div
                        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
                        style={{
                            width: overlaySize,
                            height: overlaySize
                        }}
                    >
                        <img
                            onDragStart={(e) => e.preventDefault()}
                            src={`${BASE_URL}/photos/${block.boardId}/${block.id}.png?quality=FULL`}
                            className="size-full object-cover"
                            alt={block.content}
                            onClick={collapse}
                        />

                        <div className="absolute inset-x-0 bottom-0 bg-black/50 p-4 text-white">
                            <p className="text-sm font-light">
                                {block.content}
                            </p>
                            {block.properties["description"] && (
                                <p className="mt-1 text-xs italic opacity-80">
                                    {block.properties["description"]}
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
