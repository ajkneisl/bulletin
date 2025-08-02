package dev.ajkneisl.bulletin

import java.io.File
import kotlin.system.exitProcess

/** Initialize the provided directory by ensuring it exists and creating a database file. */
fun initializeDirectory(directory: String) {
    val dir = File(directory)

    logger.debug("Attempting to initialize directory {}...", dir.absolutePath)

    if (!dir.exists()) {
        logger.debug("Directory does not exist, attempting to create...")
        val creationSuccessful = dir.mkdirs()

        if (!creationSuccessful) {
            logger.error("Failed to create directory, exiting.")
            exitProcess(-1)
        }

        logger.debug("Successfully created directory.")
    }

    val database = File(dir, "photos.db")

    if (!database.exists()) {
        logger.debug("Database does not exist, attempting to create...")
        val creationSuccessful = database.createNewFile()

        if (!creationSuccessful) {
            logger.error("Database creation failed, exiting.")
            exitProcess(-1)
        }

        logger.debug("Successfully created database.")
    }

    // ok :)
}
