import React from "react"

/**
 * {@link ActionItem}
 */
type ActionItemProps = {
    icon: React.ReactNode
    delay?: string
    action?: () => void
}

/**
 * An individual item on the FoB.
 *
 * @param icon The icon for the item.
 * @param action When the item is pressed.
 * @param delay The animation delay.
 */
export default function ActionItem({
    icon,
    action,
    delay = "0"
}: ActionItemProps) {
    return (
        <button
            onClick={action}
            className={`pointer-events-auto flex size-10 translate-y-0 scale-0 items-center justify-center rounded-full bg-white/75 text-black opacity-0 shadow-md transition-all duration-300 ease-out group-hover:translate-y-[-55px] group-hover:scale-100 group-hover:opacity-100`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {icon}
        </button>
    )
}
