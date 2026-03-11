package dev.ajkneisl.bulletin.boards

import org.jetbrains.exposed.sql.Table

/** Table for [Board]s. */
object Boards : Table("boards") {
    val id = varchar("id", 8)

    override val primaryKey = PrimaryKey(id)

    val name = text("name")
    val description = text("description")
    val author = text("author")
    val timestamp = long("timestamp")
}
