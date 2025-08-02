package dev.ajkneisl.bulletin.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import dev.ajkneisl.bulletin.domain
import java.io.File
import java.security.SecureRandom
import java.util.Date
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import kotlin.system.exitProcess
import org.slf4j.Logger
import org.slf4j.LoggerFactory

/** Handles all JWT / secret */
object JwtHandler {
    val LOGGER: Logger = LoggerFactory.getLogger(this::class.java)

    /** Generate a secure key. */
    private fun generateKey(): SecretKey {
        try {
            val keyGenerator = KeyGenerator.getInstance("AES")

            keyGenerator.init(256, SecureRandom())

            return keyGenerator.generateKey()
        } catch (e: Exception) {
            LOGGER.error("Failed to generate key: ", e)

            exitProcess(-1)
        }
    }

    /**
     * Secret for JWT. Stored in a file called `secret`.
     *
     * TODO: find something more optimal :(
     */
    private val SECRET by lazy {
        val secretFile = File("secret")

        if (secretFile.exists()) {
            secretFile.readText()
        } else {
            val newSecret = String(generateKey().encoded)

            secretFile.writeText(newSecret)

            newSecret
        }
    }

    private val key = Algorithm.HMAC512(SECRET)

    /** How long the JWT is valid for. */
    private const val VALIDITY_MS = 1000 * 60 * 60 * 24 // 1 day :)

    /** Generate a token for a username */
    fun generateToken(username: String): String {
        return JWT.create()
            .withSubject(username)
            .withIssuer(domain)
            .withAudience(domain)
            .withExpiresAt(Date(System.currentTimeMillis() + VALIDITY_MS))
            .sign(key)
    }

    /** Verifier using same algorithm, audience, and issuer */
    val VERIFIER = JWT.require(key).withAudience(domain).withIssuer(domain).build()
}
