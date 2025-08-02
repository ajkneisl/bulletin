package dev.ajkneisl.bulletin

import java.io.File
import org.jetbrains.exposed.sql.Database

/** Load a database */
fun loadDatabase(databaseFile: File) {
    Database.connect("jdbc:sqlite:${databaseFile.absolutePath}", driver = "org.sqlite.JDBC")
}
