import { useEffect, useState } from "react"
import { atom, useAtom } from "jotai"

export const dimensionsAtom = atom({
    COL_WIDTH: 100,
    ROW_HEIGHT: 100,
    MAX_WIDTH: 3,
    MAX_HEIGHT: 3,
    COLS: 3,
    ROWS: 12
})

export const useDimensions = () => {
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })

    const [, setDimensions] = useAtom(dimensionsAtom)

    useEffect(() => {
        const maxGrid = 512 // max-w-lg
        const gridWidth = Math.min(screenSize.width, maxGrid)
        const colWidth = Math.floor(gridWidth / 3)

        setDimensions({
            COL_WIDTH: colWidth,
            ROW_HEIGHT: colWidth,
            MAX_WIDTH: 3,
            MAX_HEIGHT: 3,
            COLS: 3,
            ROWS: 12
        })
    }, [screenSize.width, setDimensions])

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
}
