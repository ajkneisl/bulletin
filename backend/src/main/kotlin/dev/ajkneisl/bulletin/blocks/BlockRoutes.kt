package dev.ajkneisl.bulletin.blocks

import dev.ajkneisl.bulletin.errors.InvalidParameters
import dev.ajkneisl.bulletin.photos.uploadPhoto
import io.ktor.http.HttpStatusCode
import io.ktor.http.HttpStatusCode.Companion.BadRequest
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receiveMultipart
import io.ktor.server.request.receiveParameters
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.util.getOrFail
import io.ktor.utils.io.jvm.javaio.toInputStream
import kotlinx.serialization.json.Json

val blockRoutes: Route.() -> Unit = {
    authenticate("administrator") {
        /** Mass shift down blocks. */
        put("/shift") {
            val parameters = call.receiveParameters()

            val blocksShifted = parameters["amount"]?.toIntOrNull() ?: 3

            // no funny business
            if (blocksShifted > 9 || blocksShifted <= 0) {
                throw InvalidParameters()
            }

            shiftBlocks(blocksShifted)

            call.respond(HttpStatusCode.OK)
        }

        /** Delete a block. */
        delete {
            val parameters = call.parameters

            val blockId = parameters.getOrFail("id")
            getBlock(blockId) ?: throw InvalidParameters() // ensure exists

            deleteBlock(blockId)

            call.respond(HttpStatusCode.OK)
        }

        /** Update a block. */
        post {
            val parameters = call.receiveParameters()

            val blockId = parameters.getOrFail("id")
            getBlock(blockId) ?: throw InvalidParameters() // ensure exists

            val name = parameters.getOrFail("name")
            val value = parameters.getOrFail("value")

            when (name.lowercase()) {
                "options" -> {
                    val option =
                        runCatching { Json.decodeFromString<HashMap<String, String>>(value) }
                            .getOrNull() ?: return@post call.respond(BadRequest)

                    updateBlockProperty(blockId, option)
                }

                "position" -> {
                    val posSpl = value.split("/")

                    if (posSpl.size != 2) {
                        call.respond(BadRequest)
                        return@post
                    }

                    val x = posSpl[0].toIntOrNull()
                    val y = posSpl[1].toIntOrNull()

                    if (x == null || y == null) {
                        call.respond(BadRequest)
                        return@post
                    }

                    updateBlockPosition(blockId, x, y)
                }

                "size" -> {
                    val sizeSpl = value.split("/")

                    if (sizeSpl.size != 2) {
                        call.respond(BadRequest)
                        return@post
                    }

                    val width = sizeSpl[0].toIntOrNull()
                    val height = sizeSpl[1].toIntOrNull()

                    if (height == null || width == null) {
                        call.respond(BadRequest)
                        return@post
                    }

                    updateBlockSize(blockId, width, height)
                }

                else -> {
                    call.respond(BadRequest)
                    return@post
                }
            }

            call.respond(HttpStatusCode.OK)
        }

        /** Create a block. */
        put {
            val parameters = call.receiveMultipart()

            var includedFile: ByteArray? = null
            var content: String? = null
            var type: BlockType? = null
            var options: HashMap<String, String> = hashMapOf()

            parameters.forEachPart { partData ->
                when (partData) {
                    is PartData.FileItem -> {
                        includedFile = partData.provider().toInputStream().readBytes()
                    }

                    is PartData.FormItem ->
                        when (partData.name?.lowercase()) {
                            "content" -> {
                                content = partData.value
                            }
                            "options" -> {
                                options =
                                    runCatching {
                                            Json.decodeFromString<HashMap<String, String>>(
                                                partData.value
                                            )
                                        }
                                        .getOrDefault(hashMapOf())
                            }
                            "type" -> {
                                type =
                                    runCatching { BlockType.valueOf(partData.value.uppercase()) }
                                        .getOrNull()
                            }
                        }

                    else -> {}
                }
            }

            // content and type must be valid
            if (content == null || type == null) {
                return@put call.respond(BadRequest)
            }

            val finalType = type!!
            val blockProperties = finalType.properties.toList().map { it.toString() }

            // photo requires a file
            if (type == BlockType.PHOTO && includedFile == null) {
                return@put call.respond(BadRequest)
            }

            // ensure all options are valid
            for (option in options.keys) {
                if (option !in blockProperties) throw InvalidParameters()
            }

            val id = createBlock(content, finalType, options)

            if (type == BlockType.PHOTO) {
                uploadPhoto(id, includedFile!!)
            }

            call.respond(
                Block(
                    id = id,
                    x = 0,
                    y = 0,
                    width = 1,
                    height = 1,
                    type = type!!,
                    content = content,
                    properties = hashMapOf(),
                )
            )
        }
    }

    /** Get a list of all [Block]s. */
    get {
        val blocks = getBlocks()

        call.respond(blocks)
    }
}
