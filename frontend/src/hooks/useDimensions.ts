import React, { useEffect, useState } from "react"
import { atom, useAtom } from "jotai"

export const dimensionsAtom = atom({
    COL_WIDTH: 100,
    ROW_HEIGHT: 100,
    MAX_WIDTH: 5,
    MAX_HEIGHT: 5,
    COLS: 9,
    ROWS: 9
})

export const useDimensions = () => {
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })

    const [dimensions, setDimensions] = useAtom(dimensionsAtom)

    const screenType = React.useMemo(() => {
        if (screenSize.width < 640) return "phone"
        if (screenSize.width < 1024) return "tablet"
        return "desktop"
    }, [screenSize.width])

    React.useEffect(() => {
        switch (screenType) {
            case "phone":
                setDimensions({
                    COL_WIDTH: 100,
                    ROW_HEIGHT: 100,
                    MAX_WIDTH: 3,
                    MAX_HEIGHT: 3,
                    COLS: 3,
                    ROWS: 12
                })
                break
            case "tablet":
                setDimensions({
                    COL_WIDTH: 120,
                    ROW_HEIGHT: 120,
                    MAX_WIDTH: 3,
                    MAX_HEIGHT: 3,
                    COLS: 6,
                    ROWS: 12
                })
                break
            case "desktop":
            default:
                setDimensions({
                    COL_WIDTH: 160,
                    ROW_HEIGHT: 160,
                    MAX_WIDTH: 3,
                    MAX_HEIGHT: 3,
                    COLS: 9,
                    ROWS: 12
                })
        }
    }, [screenType, setDimensions])

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return dimensions
}
