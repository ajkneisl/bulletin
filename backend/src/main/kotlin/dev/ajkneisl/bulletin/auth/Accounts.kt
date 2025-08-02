package dev.ajkneisl.bulletin.auth

import dev.ajkneisl.bulletin.blocks.Block
import org.jetbrains.exposed.sql.Table

/** Table for [Block]s. */
object Accounts : Table("accounts") {
    val id = integer("id").autoIncrement()

    override val primaryKey = PrimaryKey(id)

    val username = varchar("username", 64)
    val password = varchar("password", 255)
}
