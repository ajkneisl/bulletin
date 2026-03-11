package dev.ajkneisl.bulletin.boards

import dev.ajkneisl.bulletin.blocks.deleteBlock
import dev.ajkneisl.bulletin.blocks.getBlocksByBoard
import dev.ajkneisl.bulletin.errors.InvalidParameters
import dev.ajkneisl.bulletin.photos.deleteBoardPhotos
import io.ktor.http.HttpStatusCode
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receiveParameters
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.put
import io.ktor.server.util.getOrFail

val boardRoutes: Route.() -> Unit = {
    /** Get all boards. */
    get {
        call.respond(getBoards())
    }

    authenticate("administrator") {
        /** Create a board. */
        put {
            val principal = call.principal<JWTPrincipal>() ?: throw InvalidParameters()
            val parameters = call.receiveParameters()

            val name = parameters.getOrFail("name")
            val description = parameters["description"] ?: ""

            val author = principal.payload.subject

            val id = createBoard(name, description, author)
            val board = getBoard(id) ?: throw InvalidParameters()

            call.respond(board)
        }

        /** Delete a board and all its blocks/photos. */
        delete("/{id}") {
            val boardId = call.parameters.getOrFail("id")
            getBoard(boardId) ?: throw InvalidParameters()

            // delete all blocks in the board
            val blocks = getBlocksByBoard(boardId)
            for (block in blocks) {
                deleteBlock(block.id, boardId)
            }

            // delete board photo directory
            deleteBoardPhotos(boardId)

            deleteBoard(boardId)

            call.respond(HttpStatusCode.OK)
        }
    }
}
