import React from "react"

type ActionItemProps = {
    icon: React.ReactNode
    delay?: string
    action?: () => void
}

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
