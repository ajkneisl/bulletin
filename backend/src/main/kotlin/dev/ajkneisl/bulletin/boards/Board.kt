package dev.ajkneisl.bulletin.boards

import dev.ajkneisl.bulletin.errors.ServerError
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update

/**
 * An individual board with blocks.
 *
 * @param id The ID of the board.
 * @param name The name of the board.
 * @param description The description of the board.
 * @param author The author of the board.
 * @param timestamp When the board was created.
 */
@Serializable
data class Board(
    val id: String,
    val name: String,
    val description: String,
    val author: String,
    val timestamp: Long,
)

private val chars = ('A'..'Z') + ('a'..'z')

/** Retrieve all boards, sorted by timestamp descending (newest first). */
suspend fun getBoards() = newSuspendedTransaction {
    Boards.selectAll().toList().map {
        Board(
            it[Boards.id],
            it[Boards.name],
            it[Boards.description],
            it[Boards.author],
            it[Boards.timestamp],
        )
    }.sortedByDescending { it.timestamp }
}

/** Get a board by its [id]. */
suspend fun getBoard(id: String): Board? = newSuspendedTransaction {
    Boards.selectAll().where { Boards.id eq id }.singleOrNull()?.let {
        Board(
            it[Boards.id],
            it[Boards.name],
            it[Boards.description],
            it[Boards.author],
            it[Boards.timestamp],
        )
    }
}

/** Create a board with [name], [description], and [author]. */
suspend fun createBoard(
    name: String,
    description: String,
    author: String,
): String = newSuspendedTransaction {
    var unique: Boolean
    var id: String

    do {
        id = (1..8).map { chars.random() }.joinToString("")
        unique = Boards.selectAll().where { Boards.id eq id }.singleOrNull() == null
    } while (!unique)

    Boards.insert {
        it[Boards.id] = id
        it[Boards.name] = name
        it[Boards.description] = description
        it[Boards.author] = author
        it[Boards.timestamp] = System.currentTimeMillis()
    } get Boards.id
}

/** Update a board's [name], [description], and/or [timestamp] by its [id]. */
suspend fun updateBoard(id: String, name: String?, description: String?, timestamp: Long?) = newSuspendedTransaction {
    Boards.selectAll().where { Boards.id eq id }.singleOrNull()
        ?: throw ServerError("Board does not exist.", 404)

    Boards.update({ Boards.id eq id }) {
        if (name != null) it[Boards.name] = name
        if (description != null) it[Boards.description] = description
        if (timestamp != null) it[Boards.timestamp] = timestamp
    }
}

/** Delete a board by its [id]. */
suspend fun deleteBoard(id: String) = newSuspendedTransaction {
    val board = Boards.selectAll().where { Boards.id eq id }.singleOrNull()
        ?: throw ServerError("Board does not exist.", 404)

    Boards.deleteWhere { Boards.id eq id }
}
