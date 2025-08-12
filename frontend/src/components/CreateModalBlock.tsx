import React from "react"
import { atom, useAtom } from "jotai"
import { createBlockOpen } from "../api/Editor"
import { FaImage } from "react-icons/fa"
import { blocksAtom, createBlock } from "../api/Blocks"

export const fileAtom = atom<File | null>(null)

export const formDetails = atom({
    content: "",
    blockType: "text"
})

export function CreateBlockModal() {
    const [, setBlocks] = useAtom(blocksAtom)
    const [file, setFile] = useAtom(fileAtom)

    const [formData, setFormData] = useAtom(formDetails)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    async function handleSubmit() {
        const block = await createBlock(
            formData.blockType,
            formData.content,
            file
        )

        setBlocks((prev) => prev.concat(block))
        setVisible(false)
    }

    const [visible, setVisible] = useAtom(createBlockOpen)

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg space-y-4 rounded-lg bg-white/50 p-6 shadow-xl">
                <h2 className="mb-2 text-xl font-semibold">New Block</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Block Type
                        </label>
                        <div className="flex space-x-2">
                            {["photo", "text"].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            blockType: type
                                        }))
                                    }
                                    className={`px-4 py-2 rounded border transition-colors ${
                                        formData.blockType === type
                                            ? "bg-green-600 text-white border-green-700"
                                            : "bg-white text-black border-gray-300 hover:bg-gray-100"
                                    }`}
                                >
                                    {type.charAt(0).toUpperCase() +
                                        type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Content
                        </label>
                        <input
                            type="text"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    {formData.blockType === "photo" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Upload Image
                            </label>
                            <div className="flex items-center space-x-3">
                                {!file ? (
                                    // File input + label
                                    <div className="flex items-center space-x-3">
                                        <label
                                            htmlFor="file-upload"
                                            className="flex cursor-pointer items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                        >
                                            <FaImage />
                                            <span>Choose File</span>
                                        </label>

                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const uploaded =
                                                    e.target.files?.[0]
                                                if (uploaded) setFile(uploaded)
                                            }}
                                        />
                                    </div>
                                ) : (
                                    // Success element
                                    <div className="flex items-center space-x-2 text-green-700">
                                        <FaImage />

                                        <span className="text-sm font-medium">
                                            File uploaded: {file.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        onClick={() => setVisible(false)}
                        className="rounded bg-gray-300 px-4 py-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="rounded bg-green-600 px-4 py-2 text-white"
                    >
                        Create Block
                    </button>
                </div>
            </div>
        </div>
    )
}
