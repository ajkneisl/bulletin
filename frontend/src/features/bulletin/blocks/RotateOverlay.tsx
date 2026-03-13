import clsx from "clsx"
import { MdRotateLeft, MdRotateRight } from "react-icons/md"
import { BASE_URL } from "../../../api/Util"
import { Block } from "../api/models/Block"

/**
 * {@link RotateOverlay}
 */
type Props = {
    block: Block
    previewSize: number
    rotationDegrees: number
    saving: boolean
    onRotate: (delta: number) => void
    onSave: () => void
    onCancel: () => void
}

/**
 * Overlay to rotate a block.
 *
 * @param block The block to rotate.
 * @param previewSize The size of the preview.
 * @param rotationDegrees The degrees per rotate.
 * @param saving If it's saving.
 * @param onRotate When rotating.
 * @param onSave When saving.
 * @param onCancel On cancel.
 */
export default function RotateOverlay({
    block,
    previewSize,
    rotationDegrees,
    saving,
    onRotate,
    onSave,
    onCancel
}: Props) {
    const displayDegrees = ((rotationDegrees % 360) + 360) % 360

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="border-neutral-800 bg-neutral-900 space-y-4 rounded-2xl border p-6 font-sans shadow-2xl">
                    <h2 className="text-neutral-100 text-lg font-semibold">
                        Rotate Image
                    </h2>

                    <div
                        className="overflow-hidden rounded-xl"
                        style={{ width: previewSize, height: previewSize }}
                    >
                        <img
                            src={`${BASE_URL}/photos/${block.boardId}/${block.id}.png?quality=THUMB`}
                            className="size-full object-cover transition-transform duration-300"
                            style={{
                                transform: `rotate(${rotationDegrees}deg)`
                            }}
                            alt={block.content}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => onRotate(-90)}
                            className="border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-750 flex items-center gap-1 rounded-xl border px-3 py-2"
                        >
                            <MdRotateLeft className="size-5" />
                        </button>

                        <span className="text-neutral-400 text-sm">
                            {displayDegrees}°
                        </span>

                        <button
                            onClick={() => onRotate(90)}
                            className="border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-750 flex items-center gap-1 rounded-xl border px-3 py-2"
                        >
                            <MdRotateRight className="size-5" />
                        </button>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="border-neutral-700 bg-neutral-850 text-neutral-200 hover:bg-neutral-800 rounded-xl border px-4 py-2"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onSave}
                            disabled={saving}
                            className={clsx(
                                "flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-600",
                                saving
                                    ? "cursor-not-allowed bg-emerald-700 opacity-75"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                            )}
                        >
                            {saving && (
                                <svg
                                    className="size-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                            )}

                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
