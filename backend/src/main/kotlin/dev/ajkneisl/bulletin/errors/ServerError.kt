package dev.ajkneisl.bulletin.errors

import java.lang.Exception

open class ServerError(message: String, val code: Int) : Exception(message)
