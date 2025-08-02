package dev.ajkneisl.bulletin.photos

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.util.getOrFail
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import javax.imageio.ImageIO
import kotlin.io.path.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.pathString
import kotlin.io.path.writeBytes
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import net.coobird.thumbnailator.Thumbnails

val photoRoutes: Route.() -> Unit = {
    /** Retrieve a specific photo. */
    get("/{id}.png") {
        val id = call.parameters.getOrFail("id")
        val quality =
            call.parameters["quality"]
                ?.runCatching { PhotoQuality.valueOf(this.uppercase()) }
                ?.getOrNull() ?: PhotoQuality.HALF

        val photo = retrievePhoto(id, quality)

        call.respondBytes(bytes = photo, contentType = ContentType.Image.PNG)
    }
}

/** Directory where database & photos are stored. */
var PHOTO_DIR = "/etc/photos"

/** Retrieve a photo's contents by its [id]. */
suspend fun retrievePhoto(id: String, quality: PhotoQuality = PhotoQuality.FULL): ByteArray {
    val photoLocation = Path(PHOTO_DIR, id, "$quality.png")

    return withContext(Dispatchers.IO) { photoLocation.toFile().readBytes() }
}

/** Upload a photo by its [id] with provided [data]. */
suspend fun uploadPhoto(id: String, data: ByteArray) {
    val photoLocation = Path(PHOTO_DIR, id)

    photoLocation.createDirectories()

    for (quality in PhotoQuality.entries) {
        val qualityLocation = Path(photoLocation.pathString, "$quality.png")

        val input = ByteArrayInputStream(data)
        val image = ImageIO.read(input)

        val output = ByteArrayOutputStream()
        Thumbnails.of(image)
            .size(image.width / quality.sizeConvert, image.height / quality.sizeConvert)
            .outputQuality(quality.qualityConvert)
            .outputFormat("png")
            .toOutputStream(output)

        withContext(Dispatchers.IO) { qualityLocation.writeBytes(output.toByteArray()) }
    }
}

/** Delete a photo by its [id]. */
suspend fun deletePhoto(id: String) {
    val photoLocation = "${PHOTO_DIR}${File.separator}${id}"

    withContext(Dispatchers.IO) { File(photoLocation).deleteRecursively() }
}
