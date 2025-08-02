package dev.ajkneisl.bulletin.auth

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import org.mindrot.jbcrypt.BCrypt
import org.slf4j.Logger
import org.slf4j.LoggerFactory

val accountLogger: Logger = LoggerFactory.getLogger("Accounts")

@Serializable data class Account(val username: String, @field:Transient val password: String = "")

/** Create a default account if no accounts exist. */
suspend fun initializeAccount() = newSuspendedTransaction {
    if (Accounts.selectAll().count() == 0L) {
        Accounts.insert {
            it[username] = "username"
            it[password] = BCrypt.hashpw("password", BCrypt.gensalt())
        }

        accountLogger.info("Created default user account.")
    }
}

/** Login to a user account. */
suspend fun login(username: String, password: String): String? = newSuspendedTransaction {
    val user = Accounts.selectAll().where { Accounts.username eq username }.singleOrNull()

    if (user != null && BCrypt.checkpw(password, user[Accounts.password])) {
        JwtHandler.generateToken(username)
    } else null
}

/** Change [username]'s password to [newPassword]. */
suspend fun changePassword(username: String, newPassword: String) = newSuspendedTransaction {
    Accounts.update({ Accounts.username eq username }) {
        it[password] = BCrypt.hashpw(newPassword, BCrypt.gensalt())
    }
}

/** Retrieve all accounts. */
suspend fun getAllAccounts(): List<Account> = newSuspendedTransaction {
    Accounts.selectAll().toList().map { row ->
        Account(row[Accounts.username], row[Accounts.password])
    }
}
