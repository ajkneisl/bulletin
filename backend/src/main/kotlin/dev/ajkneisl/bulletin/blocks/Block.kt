package dev.ajkneisl.bulletin.blocks

import dev.ajkneisl.bulletin.errors.ServerError
import dev.ajkneisl.bulletin.photos.deletePhoto
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.SqlExpressionBuilder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import kotlin.collections.map

/**
 * A block that is placed on the bulletin.
 *
 * @param id The ID of the block.
 * @param boardId The ID of the board this block belongs to.
 * @param x The X position of the block on the bulletin grid.
 * @param y The Y position of the block on the bulletin grid.
 * @param width The width of the block, in intervals of grid size.
 * @param height The height of the block, in intervals of grid size.
 * @param type The type of the block.
 * @param content The content of the block.
 * @param properties The properties of the block, typically pertaining to the [type].
 */
@Serializable
data class Block(
    val id: String,
    val boardId: String,
    val x: Int,
    val y: Int,
    val width: Int,
    val height: Int,
    val type: BlockType,
    val content: String,
    val properties: HashMap<String, String>,
)

/** Update an block's ([id]) position to [x], [y]. */
suspend fun updateBlockPosition(id: String, x: Int, y: Int) = newSuspendedTransaction {
    Blocks.update({ Blocks.id eq id }) {
        it[Blocks.x] = x
        it[Blocks.y] = y
    }
}

/**
 * Update a block's ([id]) properties.
 *
 * This simply appends, or overwrites if they exist, the current properties.
 */
suspend fun updateBlockProperty(id: String, properties: HashMap<String, String>) =
    newSuspendedTransaction {
        val blockProperties =
            Blocks.select(Blocks.id, Blocks.properties).where { Blocks.id eq id }.singleOrNull()
                ?: throw ServerError("Invalid block.", 400)

        val decodedProperties =
            Json.decodeFromString<HashMap<String, String>>(blockProperties[Blocks.properties])

        decodedProperties.putAll(properties)

        Blocks.update({ Blocks.id eq id }) {
            it[Blocks.properties] = Json.encodeToString(decodedProperties)
        }
    }

/** Update a blocks ([id]) size to [width], height. */
suspend fun updateBlockSize(id: String, width: Int, height: Int) = newSuspendedTransaction {
    Blocks.update({ Blocks.id eq id }) {
        it[Blocks.width] = width
        it[Blocks.height] = height
    }
}

private fun rowToBlock(it: org.jetbrains.exposed.sql.ResultRow) = Block(
    it[Blocks.id],
    it[Blocks.boardId],
    it[Blocks.x],
    it[Blocks.y],
    it[Blocks.width],
    it[Blocks.height],
    it[Blocks.type],
    it[Blocks.content],
    Json.decodeFromString(it[Blocks.properties]),
)

/** Retrieve all [Block]s for a specific board. */
suspend fun getBlocksByBoard(boardId: String) = newSuspendedTransaction {
    Blocks.selectAll().where { Blocks.boardId eq boardId }.toList().map { rowToBlock(it) }
}

/**
 * Get a block by it's [id].
 */
suspend fun getBlock(id: String): Block? = newSuspendedTransaction {
    Blocks.selectAll().where { Blocks.id eq id }.singleOrNull()?.let { rowToBlock(it) }
}

private val chars = ('A'..'Z') + ('a'..'z')

/** Create a block at 0, 0 with [content] and [type] in board [boardId]. */
suspend fun createBlock(
    boardId: String,
    content: String,
    type: BlockType,
    options: HashMap<String, String>,
): String = newSuspendedTransaction {
    var unique: Boolean
    var id: String

    do {
        id = (1..8).map { chars.random() }.joinToString("")

        unique = Blocks.selectAll().where { Blocks.id eq id }.singleOrNull() == null
    } while (!unique)

    Blocks.insert {
        it[Blocks.id] = id
        it[Blocks.boardId] = boardId
        it[Blocks.x] = 0
        it[Blocks.y] = 0
        it[Blocks.width] = 1
        it[Blocks.height] = 1
        it[Blocks.type] = type
        it[Blocks.content] = content
        it[Blocks.properties] = Json.encodeToString(options)
    } get Blocks.id
}

/** Delete a block by it's ID, with its [boardId] for photo cleanup. */
suspend fun deleteBlock(id: String, boardId: String) = newSuspendedTransaction {
    val block = Blocks.selectAll().where { Blocks.id eq id }.singleOrNull()

    if (block != null) {
        Blocks.deleteWhere { Blocks.id eq id }

        if (block[Blocks.type] == BlockType.PHOTO) {
            deletePhoto(boardId, id)
        }
    }
}

/** Shift all blocks in a board down by a certain amount. */
suspend fun shiftBlocks(boardId: String, amount: Int) = newSuspendedTransaction {
    for (block in getBlocksByBoard(boardId)) {
        Blocks.update({ Blocks.id eq block.id }) {
            with(SqlExpressionBuilder) { it.update(Blocks.y, Blocks.y + amount) }
        }
    }
}
