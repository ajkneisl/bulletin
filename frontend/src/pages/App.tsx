import React, { useEffect, useState } from "react"
import Bulletin from "../features/bulletin/Bulletin"
import {
    CreateBlockModal,
    fileAtom,
    formDetails
} from "../features/bulletin/CreateModalBlock"
import ActionButton from "../features/action/ActionButton"
import { useAtom } from "jotai"
import { authorizationToken, createBlockOpen } from "../api/Editor"
import { useDimensions } from "../hooks/useDimensions"
import { InsertLinesModal } from "../features/bulletin/InsertLinesModal"

export default function App() {
    useDimensions()

    const [token] = useAtom(authorizationToken)

    const [isDragging, setIsDragging] = useState(false)
    const [, setShowModal] = useAtom(createBlockOpen)

    const [, setFile] = useAtom(fileAtom)
    const [, setForm] = useAtom(formDetails)

    useEffect(() => {
        let dragCounter = 0

        const handleDragEnter = (e: DragEvent) => {
            dragCounter++
            if (e.dataTransfer?.types.includes("Files")) {
                setIsDragging(true)
            }
        }

        const handleDragLeave = () => {
            dragCounter--
            if (dragCounter === 0) {
                setIsDragging(false)
            }
        }

        const handleDrop = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            dragCounter = 0

            if (e.dataTransfer?.files?.length) {
                const file = e?.dataTransfer?.files[0]

                setFile(file)
                setForm((prev) => ({ ...prev, blockType: "photo" }))

                setShowModal(true)
            }
        }

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault()
        }

        window.addEventListener("dragenter", handleDragEnter)
        window.addEventListener("dragleave", handleDragLeave)
        window.addEventListener("drop", handleDrop)
        window.addEventListener("dragover", handleDragOver)

        return () => {
            window.removeEventListener("dragenter", handleDragEnter)
            window.removeEventListener("dragleave", handleDragLeave)
            window.removeEventListener("drop", handleDrop)
            window.removeEventListener("dragover", handleDragOver)
        }
    }, [setFile, setForm, setShowModal])

    return (
        <div className="relative h-screen w-screen">
            {/* Main content */}
            <div className="flex flex-row items-center justify-center">
                <Bulletin />
            </div>

            <ActionButton />

            {/* Upload overlay */}
            {isDragging && token && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="rounded-lg border-4 border-dashed border-white px-10 py-6 text-5xl font-bold text-white">
                        Drop files to upload
                    </div>
                </div>
            )}

            {token && <CreateBlockModal />}
            {token && <InsertLinesModal />}
        </div>
    )
}
