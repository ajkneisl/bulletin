import React from "react"
import { atom, useAtom } from "jotai"
import { FaImage } from "react-icons/fa"
import { AnimatePresence, motion } from "framer-motion"
import { blocksAtom, createBlock } from "./api/Blocks"
import { authorizationToken, createBlockOpen } from "../../api/Editor"
import { HTMLInputElement } from "happy-dom"

export type BlockQuality = "FULL" | "HALF" | "THUMB"

export const fileAtom = atom<File | null>(null)

type FormDetails = {
    content: string
    blockType: "photo" | "text"
    // photo-only
    longDescription: string
    defaultQuality: BlockQuality
    // text-only
    fontSize: number
    fontGrow: boolean
}

export const formDetails = atom<FormDetails>({
    content: "",
    blockType: "text",
    longDescription: "",
    defaultQuality: "FULL",
    fontSize: 16,
    fontGrow: true
})

/**
 * Create a new block.
 * @constructor
 */
export function CreateBlockModal() {
    const [, setBlocks] = useAtom(blocksAtom)
    const [file, setFile] = useAtom(fileAtom)
    const [formData, setFormData] = useAtom(formDetails)
    const [visible, setVisible] = useAtom(createBlockOpen)
    const [token] = useAtom(authorizationToken)

    const setField =
        <K extends keyof FormDetails>(key: K) =>
        (value: FormDetails[K]) =>
            setFormData((prev) => ({ ...prev, [key]: value }))

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, type, value } = e.currentTarget
        if (type === "checkbox") {
            setFormData((prev) => ({
                ...prev,
                [name]: e.currentTarget.checked
            }))
        } else if (type === "number") {
            setFormData((prev) => ({ ...prev, [name]: Number(value) }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    async function handleSubmit() {
        const block = await createBlock(
            token ?? "",
            formData.blockType,
            formData.content,
            formData.blockType === "photo"
                ? {
                      DEFAULT_QUALITY: `${formData.defaultQuality}`,
                      LONG_DESCRIPTION: formData.longDescription
                  }
                : {
                      FONT_GROW: `${formData.fontGrow}`,
                      FONT_SIZE: `${formData.fontSize}`
                  },
            file
        )
        setBlocks((prev) => prev.concat(block))
        setVisible(false)
    }

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Dialog wrapper to center content and allow exit animation */}
                    <motion.div
                        key="wrapper"
                        className="fixed inset-0 z-40 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Dialog */}
                        <motion.div
                            key="dialog"
                            role="dialog"
                            aria-modal="true"
                            className="w-full max-w-lg space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
                            initial={{ y: 12, scale: 0.98, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 12, scale: 0.98, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 28
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-neutral-100">
                                    New Block
                                </h2>
                                <button
                                    onClick={() => setVisible(false)}
                                    className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Block Type */}
                            <div className="space-y-2">
                                <label className="block text-xs uppercase tracking-wide text-neutral-400">
                                    Block Type
                                </label>
                                <div className="flex gap-2">
                                    {(["photo", "text"] as const).map(
                                        (type) => {
                                            const active =
                                                formData.blockType === type
                                            return (
                                                <motion.button
                                                    key={type}
                                                    type="button"
                                                    onClick={() =>
                                                        setField("blockType")(
                                                            type
                                                        )
                                                    }
                                                    whileTap={{ scale: 0.98 }}
                                                    whileHover={{ y: -1 }}
                                                    className={[
                                                        "px-4 py-2 rounded-xl border transition-colors",
                                                        active
                                                            ? "border-emerald-500 bg-emerald-600 text-white"
                                                            : "border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-750"
                                                    ].join(" ")}
                                                >
                                                    {type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        type.slice(1)}
                                                </motion.button>
                                            )
                                        }
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <label className="block text-xs uppercase tracking-wide text-neutral-400">
                                    Content
                                </label>
                                <input
                                    type="text"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder={
                                        formData.blockType === "photo"
                                            ? "Image caption"
                                            : "Text block content"
                                    }
                                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>

                            {/* Switcher for per-type options with animation */}
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    {formData.blockType === "photo" ? (
                                        <motion.div
                                            key="photo-panel"
                                            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.18 }}
                                        >
                                            {/* Long Description */}
                                            <div className="space-y-2">
                                                <label className="block text-xs uppercase tracking-wide text-neutral-400">
                                                    Long Description
                                                </label>
                                                <textarea
                                                    name="longDescription"
                                                    value={
                                                        formData.longDescription
                                                    }
                                                    onChange={handleChange}
                                                    rows={4}
                                                    placeholder="Long description of the photo."
                                                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                />
                                            </div>

                                            {/* Default Quality */}
                                            <div className="space-y-2">
                                                <label className="block text-xs uppercase tracking-wide text-neutral-400">
                                                    Default Quality
                                                </label>
                                                <select
                                                    name="defaultQuality"
                                                    value={
                                                        formData.defaultQuality
                                                    }
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                >
                                                    <option value="FULL">
                                                        FULL
                                                    </option>
                                                    <option value="HALF">
                                                        HALF
                                                    </option>
                                                    <option value="THUMB">
                                                        THUMB
                                                    </option>
                                                </select>
                                            </div>

                                            {/* File upload */}
                                            <div className="space-y-2">
                                                <label className="block text-xs uppercase tracking-wide text-neutral-400">
                                                    Upload Image
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    {!file ? (
                                                        <>
                                                            <label
                                                                htmlFor="file-upload"
                                                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                                                            >
                                                                <FaImage />
                                                                <span>
                                                                    Choose File
                                                                </span>
                                                            </label>
                                                            <input
                                                                id="file-upload"
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const uploaded =
                                                                        e.target
                                                                            .files?.[0]
                                                                    if (
                                                                        uploaded
                                                                    )
                                                                        setFile(
                                                                            uploaded
                                                                        )
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-emerald-400">
                                                            <FaImage />
                                                            <span className="text-sm">
                                                                File:{" "}
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setFile(
                                                                        null
                                                                    )
                                                                }
                                                                className="rounded-md border border-emerald-700 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-800/40"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="text-panel"
                                            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.18 }}
                                        >
                                            {/* Font Size */}
                                            <div className="space-y-2">
                                                <label className="block text-xs uppercase tracking-wide text-neutral-400">
                                                    Font Size (px)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="fontSize"
                                                    min={8}
                                                    max={128}
                                                    step={1}
                                                    value={formData.fontSize}
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                />
                                            </div>

                                            {/* Font Grow */}
                                            <div className="flex items-center gap-3">
                                                <input
                                                    id="font-grow"
                                                    type="checkbox"
                                                    name="fontGrow"
                                                    checked={formData.fontGrow}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 cursor-pointer rounded border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-emerald-600"
                                                />
                                                <label
                                                    htmlFor="font-grow"
                                                    className="text-sm text-neutral-200"
                                                >
                                                    Font grows with block size
                                                </label>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setVisible(false)}
                                    className="rounded-xl border border-neutral-700 bg-neutral-850 px-4 py-2 text-neutral-200 hover:bg-neutral-800"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    onClick={handleSubmit}
                                    whileTap={{ scale: 0.98 }}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                >
                                    Create Block
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
