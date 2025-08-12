import { Block } from "features/bulletin/api/models/Block"
import React, { useEffect, useRef, useState } from "react"

/**
 * A text block.
 *
 * @param block The block itself.
 * @constructor
 */
export default function TextBlock({ block }: { block: Block }) {
    const ref = useRef<HTMLDivElement>(null)

    const [fontSize, setFontSize] = useState<number>(0)

    useEffect(() => {
        const element = ref.current

        if (!element) return
        if (block.properties["AUTO_RESIZE"] === "false") return

        const updateFontSize = () => {
            const width = element.getBoundingClientRect().width * 1.25
            const minFont = Math.floor((width / block.content.length) * 1.25)
            setFontSize(minFont)
        }

        updateFontSize()

        const observer = new ResizeObserver(() => {
            updateFontSize()
        })

        observer.observe(element)

        return () => observer.disconnect()
    }, [block.content.length, block.properties])

    return (
        <div
            ref={ref}
            className="group z-0 flex size-full flex-row items-center justify-center p-4 transition-all duration-300"
        >
            <p style={{ fontSize: `${fontSize}px` }}>{block.content}</p>
        </div>
    )
}
