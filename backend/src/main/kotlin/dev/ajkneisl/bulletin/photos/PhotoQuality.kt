package dev.ajkneisl.bulletin.photos

/** The quality of a photo. */
enum class PhotoQuality(val sizeConvert: Int, val qualityConvert: Double) {
    FULL(1, 1.0),
    HALF(2, .5),
    THUMBNAIL(4, .25),
}
