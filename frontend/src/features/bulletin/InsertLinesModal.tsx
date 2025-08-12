import React, { useState } from "react"
import { useAtom } from "jotai"
import { AnimatePresence, motion } from "framer-motion"
import { authorizationToken, insertLinesOpen } from "../../api/Editor"
import { blocksAtom, shiftBlocks } from "./api/Blocks"

/** Insert Lines modal  */
export function InsertLinesModal() {
    const [token] = useAtom(authorizationToken)
    const [visible, setVisible] = useAtom(insertLinesOpen)
    const [, setBlocks] = useAtom(blocksAtom)
    const [count, setCount] = useState(1)

    const clamp = (n: number) => Math.max(1, Math.min(9, n))

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const n = Number(e.target.value)
        if (Number.isNaN(n)) return
        setCount(clamp(n))
    }

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
        setCount((c) => clamp(c))
    }

    const handleConfirm = async () => {
        const amount = clamp(count)

        try {
            await shiftBlocks(token ?? "", amount)

            setBlocks((prev) => {
                return prev.map((block) => ({
                    ...block,
                    y: block.y + amount
                }))
            })
        } catch (e) {
            // todo: catch error
        }

        setVisible(false)
        setCount(1)
    }

    const handleCancel = () => {
        setVisible(false)
        setCount(1)
    }

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    {/* Wrapper */}
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Dialog */}
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            className="w-full max-w-md space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
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
                                    Insert Lines
                                </h2>
                                <button
                                    onClick={handleCancel}
                                    className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs uppercase tracking-wide text-neutral-400">
                                    Number of Lines (1–9)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={9}
                                    step={1}
                                    value={count}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={handleCancel}
                                    className="rounded-xl border border-neutral-700 bg-neutral-850 px-4 py-2 text-neutral-200 hover:bg-neutral-800"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    onClick={handleConfirm}
                                    whileTap={{ scale: 0.98 }}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                >
                                    Confirm
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
