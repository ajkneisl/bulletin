import React, { useMemo } from "react"
import { MdAccountBox, MdEdit } from "react-icons/md"
import { FaPlus } from "react-icons/fa6"
import { FaCog } from "react-icons/fa"
import { useAtom } from "jotai"
import {
    authorizationToken,
    createBlockOpen,
    editorMode
} from "../../api/Editor"
import clsx from "clsx"
import ActionItem from "./ActionItem"

/**
 * Button on the bottom right of the screen.
 *
 * @constructor
 */
export default function ActionButton() {
    const [editor, setEditor] = useAtom(editorMode)
    const [, openCreate] = useAtom(createBlockOpen)
    const [token, setToken] = useAtom(authorizationToken)

    const className = clsx(
        `absolute inset-0 flex items-center justify-center rounded-full text-black transition-all duration-300`,
        editor
            ? "bg-green-500/75 hover:bg-green-500/100"
            : "bg-white/75 hover:bg-white/100"
    )

    if (!token) {
        return <></>
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="group relative size-12">
                <button
                    onClick={() => setEditor((prev) => !prev)}
                    className={className}
                >
                    <MdEdit />
                </button>

                <div className="pointer-events-none absolute bottom-0 right-1 flex flex-col items-end gap-2">
                    <ActionItem
                        action={() => openCreate(true)}
                        icon={<FaPlus />}
                        delay="75"
                    />
                </div>
            </div>
        </div>
    )
}
