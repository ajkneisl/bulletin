import clsx from "clsx"
import { BASE_URL } from "../../../api/Util"
import React, { useMemo } from "react"
import { Block } from "../../../api/models/Block"
import { useAtom } from "jotai"
import { editorMode } from "../../../api/Editor"
import { expandedBlockAtom } from "../../../api/Blocks"

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

    const isExpanded = useMemo(
        () => expandedBlock === block.id,
        [block.id, expandedBlock]
    )

    /**
     * Expands the block by 1 in each dimension.
     */
    function expand() {
        if (editor) return

        setExpandedBlock((prev) => {
            if (prev === block.id) return null
            else return block.id
        })
    }

    return (
        <div
            className={clsx(
                "group size-full cursor-pointer transition-all duration-300",
                isExpanded ? "z-30" : "z-0"
            )}
            onClick={expand}
        >
            <img
                ref={imgRef}
                onDragStart={(e) => e.preventDefault()}
                src={`${BASE_URL}/photos/${block.id}.png?quality=HALF`}
                className={clsx(
                    "size-full object-cover transition-all duration-300",
                    isExpanded ? "shadow-2xl" : "",
                    editor ? "pointer-events-none" : ""
                )}
                alt={block.content}
            />

            {/* hover view */}
            {!isExpanded && !editor && (
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

            {/* description view */}
            {isExpanded && !editor && (
                <div className="absolute inset-x-0 bottom-0 z-30 bg-black/50 p-4 text-white">
                    <p className="mb-2 text-sm font-light">{block.content}</p>

                    <p className="text-xs italic opacity-80">
                        {block.properties["description"]}
                    </p>
                </div>
            )}
        </div>
    )
}
