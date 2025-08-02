package dev.ajkneisl.bulletin

import dev.ajkneisl.bulletin.auth.Accounts
import dev.ajkneisl.bulletin.auth.JwtHandler
import dev.ajkneisl.bulletin.auth.getAllAccounts
import dev.ajkneisl.bulletin.auth.login
import dev.ajkneisl.bulletin.blocks.Blocks
import dev.ajkneisl.bulletin.blocks.blockRoutes
import dev.ajkneisl.bulletin.errors.InvalidAuthorization
import dev.ajkneisl.bulletin.errors.InvalidParameters
import dev.ajkneisl.bulletin.errors.ServerError
import dev.ajkneisl.bulletin.photos.PHOTO_DIR
import dev.ajkneisl.bulletin.photos.photoRoutes
import dev.hayden.KHealth
import io.ktor.http.CacheControl
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.CachingOptions
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.auth.principal
import io.ktor.server.engine.embeddedServer
import io.ktor.server.http.content.react
import io.ktor.server.http.content.singlePageApplication
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.autohead.AutoHeadResponse
import io.ktor.server.plugins.cachingheaders.CachingHeaders
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.receiveParameters
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import java.io.File
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.slf4j.Logger
import org.slf4j.LoggerFactory

val logger: Logger = LoggerFactory.getLogger("Application")

private var port: Int = 8080
var domain: String = "http://localhost:$port"

/**
 * main entrypoint :)
 *
 * @author AJ Kneisl <aj@ajkneisl.dev>
 */
fun main(args: Array<String>) {
    val directory =
        if (args.isNotEmpty()) {
            args[0]
        } else {
            "/etc/photos"
        }

    // find port
    val envPort = System.getenv("PORT")
    if (envPort != null) {
        port =
            try {
                Integer.parseInt(envPort)
            } catch (_: Exception) {
                logger.error("Failed to parse included port ($envPort)")

                8080
            }
    }

    logger.info("Using port: $port")

    // find domain
    val envDomain = System.getenv("DOMAIN")
    if (envDomain != null) {
        domain = envDomain
    }

    logger.info("Using domain: $domain")

    logger.debug("Attempting to use {} as storage directory...", directory)
    initializeDirectory(directory)

    PHOTO_DIR = directory

    // initialize db
    runBlocking {
        loadDatabase(File(directory, "photos.db"))

        newSuspendedTransaction { SchemaUtils.createMissingTablesAndColumns(Accounts, Blocks) }
    }

    embeddedServer(
            Netty,
            port = port,
            host = "0.0.0.0",
            module = Application::module,
            watchPaths = listOf(),
        )
        .start(wait = true)
}

/** primary module :) */
fun Application.module() {
    install(CachingHeaders) {
        options { call, outgoingContent ->
            when (outgoingContent.contentType?.withoutParameters()) {
                ContentType.Image.PNG ->
                    CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 60 * 60 * 24)) // 1 day

                else -> null
            }
        }
    }

    install(ContentNegotiation) {
        json(
            Json {
                encodeDefaults = true
                ignoreUnknownKeys = true
                prettyPrint = false
            }
        )
    }

    install(KHealth) {
        readyCheckPath = "/api/ready"
        healthCheckPath = "/api/health"
    }

    install(CORS) {
        allowHeader(HttpHeaders.Authorization)
        anyMethod()
        anyHost()
    }
    install(AutoHeadResponse)
    install(StatusPages) {
        // handled server error
        exception<ServerError> { call, cause ->
            call.respond(HttpStatusCode.fromValue(cause.code), hashMapOf("error" to cause.message))
        }

        // unhandled server error
        exception<Throwable> { call, cause ->
            logger.error("There was an issue with a request", cause)
            call.respond(
                HttpStatusCode.InternalServerError,
                hashMapOf("error" to "There was an issue with that request."),
            )
        }
    }

    install(Authentication) {
        jwt("administrator") {
            verifier(JwtHandler.VERIFIER)

            validate { credential ->
                if (credential.payload.subject != null) {
                    JWTPrincipal(credential.payload)
                } else null
            }

            challenge { _, _ -> throw InvalidAuthorization() }
        }
    }

    routing {
        singlePageApplication { react("content") }

        route("/api") {
            authenticate("administrator") {
                route("/account") {
                    /** View account. */
                    get {
                        val principal = call.principal<JWTPrincipal>() ?: throw InvalidParameters()

                        // show all users
                        if (call.queryParameters.contains("all")) {
                            call.respond(getAllAccounts())
                            return@get
                        }

                        val username = principal.payload.subject

                        call.respond(mapOf("username" to username))
                    }

                    /** Update account. */
                    post {
                        val principal =
                            call.principal<JWTPrincipal>() ?: throw InvalidAuthorization()

                        val username = principal.payload.subject

                        call.respond(mapOf("username" to username))
                    }
                }
            }

            /** Login */
            post("/login") {
                val params = call.receiveParameters()
                val username = params["username"] ?: throw InvalidParameters()
                val password = params["password"] ?: throw InvalidParameters()

                val token = login(username, password) ?: throw InvalidParameters()

                call.respond(mapOf("token" to token))
            }

            /** Photos */
            route("/photos", photoRoutes)

            /** Blocks */
            route("/blocks", blockRoutes)
        }
    }
}
