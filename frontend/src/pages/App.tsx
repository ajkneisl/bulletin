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
import {
    boardsAtom,
    createBoard,
    retrieveBoards,
    selectedBoardAtom
} from "../features/bulletin/api/Boards"
import { Board } from "../features/bulletin/api/models/Board"
import clsx from "clsx"

export default function App() {
    useDimensions()

    const [token] = useAtom(authorizationToken)

    const [isDragging, setIsDragging] = useState(false)
    const [, setShowModal] = useAtom(createBlockOpen)

    const [, setFile] = useAtom(fileAtom)
    const [, setForm] = useAtom(formDetails)

    const [boards, setBoards] = useAtom(boardsAtom)
    const [selectedBoard, setSelectedBoard] = useAtom(selectedBoardAtom)

    const [showCreateBoard, setShowCreateBoard] = useState(false)
    const [newBoardName, setNewBoardName] = useState("")
    const [newBoardDescription, setNewBoardDescription] = useState("")

    // load boards on mount, select most recent
    useEffect(() => {
        retrieveBoards().then((fetchedBoards) => {
            setBoards(fetchedBoards)
            if (fetchedBoards.length > 0 && !selectedBoard) {
                setSelectedBoard(fetchedBoards[0])
            }
        })
    }, [setBoards, setSelectedBoard])

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

    async function handleCreateBoard() {
        if (!token || !newBoardName.trim()) return

        const board = await createBoard(
            token,
            newBoardName.trim(),
            newBoardDescription.trim()
        )

        setBoards((prev) => [board, ...prev])
        setSelectedBoard(board)
        setShowCreateBoard(false)
        setNewBoardName("")
        setNewBoardDescription("")
    }

    function selectBoard(board: Board) {
        setSelectedBoard(board)
    }

    return (
        <div className="relative min-h-screen w-screen font-serif">
            {/* Board header */}
            {selectedBoard && (
                <div className="px-4 pt-6 text-center">
                    <h1 className="text-3xl italic text-white">
                        {selectedBoard.name}
                    </h1>
                    {selectedBoard.description && (
                        <p className="mt-1 text-sm text-neutral-400">
                            {selectedBoard.description}
                        </p>
                    )}
                </div>
            )}

            {/* Main content */}
            <Bulletin />

            {/* Board selector */}
            <div className="mx-auto mt-12 max-w-lg px-6 pb-12">
                {boards.map((board) => (
                    <button
                        key={board.id}
                        onClick={() => selectBoard(board)}
                        className={clsx(
                            "block w-full text-left",
                            selectedBoard?.id === board.id
                                ? "text-white"
                                : "text-neutral-600 hover:text-neutral-400"
                        )}
                    >
                        <div className="flex items-baseline justify-between">
                            <span
                                className={clsx(
                                    "lowercase",
                                    selectedBoard?.id === board.id
                                        ? "underline underline-offset-4"
                                        : ""
                                )}
                            >
                                {board.name}
                            </span>
                            <span className="text-xs">
                                {new Date(
                                    board.timestamp
                                ).toLocaleDateString()}
                            </span>
                        </div>
                        {board.description && (
                            <p className="text-xs lowercase opacity-60">
                                {board.description}
                            </p>
                        )}
                    </button>
                ))}

                {token && (
                    <>
                        <button
                            onClick={() =>
                                setShowCreateBoard((prev) => !prev)
                            }
                            className="mt-3 text-xs lowercase text-neutral-600 underline underline-offset-4 hover:text-neutral-400"
                        >
                            {showCreateBoard ? "cancel" : "new board"}
                        </button>

                        {showCreateBoard && (
                            <div className="mt-2 space-y-2">
                                <input
                                    type="text"
                                    value={newBoardName}
                                    onChange={(e) =>
                                        setNewBoardName(e.target.value)
                                    }
                                    placeholder="name"
                                    className="w-full border-b border-neutral-800 bg-transparent py-1 text-sm lowercase text-neutral-100 placeholder-neutral-700 focus:border-neutral-500 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value={newBoardDescription}
                                    onChange={(e) =>
                                        setNewBoardDescription(e.target.value)
                                    }
                                    placeholder="description"
                                    className="w-full border-b border-neutral-800 bg-transparent py-1 text-sm lowercase text-neutral-100 placeholder-neutral-700 focus:border-neutral-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleCreateBoard}
                                    className="text-xs lowercase text-neutral-500 underline underline-offset-4 hover:text-neutral-300"
                                >
                                    create
                                </button>
                            </div>
                        )}
                    </>
                )}

                {boards.length === 0 && !showCreateBoard && (
                    <p className="text-sm lowercase text-neutral-700">
                        no boards yet
                    </p>
                )}
            </div>

            <footer className="pb-6 pt-12 text-center">
                <a
                    href="https://ajkneisl.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs lowercase text-neutral-600 underline underline-offset-4 hover:text-neutral-400"
                >
                    ajkneisl.dev
                </a>
            </footer>

            <ActionButton />

            {/* Upload overlay */}
            {isDragging && token && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="border-2 border-dashed border-white px-10 py-6 text-3xl italic text-white">
                        drop files to upload
                    </div>
                </div>
            )}

            {token && <CreateBlockModal />}
            {token && <InsertLinesModal />}
        </div>
    )
}
