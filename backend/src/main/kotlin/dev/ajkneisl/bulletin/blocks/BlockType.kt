package dev.ajkneisl.bulletin.blocks

import dev.ajkneisl.bulletin.blocks.types.PhotoProperties
import dev.ajkneisl.bulletin.blocks.types.TextProperties
import kotlin.enums.EnumEntries

/**
 * The type of block.
 *
 * @see Block
 */
enum class BlockType(val properties: EnumEntries<*>) {
    PHOTO(PhotoProperties.entries),
    TEXT(TextProperties.entries),
}
