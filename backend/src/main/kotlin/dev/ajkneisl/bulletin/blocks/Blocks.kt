package dev.ajkneisl.bulletin.blocks

import org.jetbrains.exposed.sql.Table

/** Table for [Block]s. */
object Blocks : Table("blocks") {
    val id = varchar("id", 8)

    override val primaryKey = PrimaryKey(id)

    val x = integer("x")
    val y = integer("y")
    val width = integer("width")
    val height = integer("height")
    val type = enumeration("type", BlockType::class)
    val content = text("content")
    val properties = text("properties")
}
