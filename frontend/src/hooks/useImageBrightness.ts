import { useEffect, useState, useRef } from "react"

export function useImageBrightness(src: string): {
    isDark: boolean | null
    imgRef: React.RefObject<HTMLImageElement>
} {
    const [isDark, setIsDark] = useState<boolean | null>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        const img = imgRef.current

        if (!img) return

        img.crossOrigin = "Anonymous"

        const analyzeBrightness = () => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            if (!ctx) return

            const width = 20
            const height = 20
            canvas.width = width
            canvas.height = height

            ctx.drawImage(img, 0, 0, width, height)
            const imageData = ctx.getImageData(0, 0, width, height).data

            let total = 0
            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i]
                const g = imageData[i + 1]
                const b = imageData[i + 2]
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b
                total += brightness
            }

            const avg = total / (width * height)
            setIsDark(avg < 128)
        }

        if (img.complete) {
            analyzeBrightness()
        } else {
            img.addEventListener("load", analyzeBrightness)
            return () => img.removeEventListener("load", analyzeBrightness)
        }
    }, [src])

    return { isDark, imgRef }
}
