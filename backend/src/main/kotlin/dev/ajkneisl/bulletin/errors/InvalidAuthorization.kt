package dev.ajkneisl.bulletin.errors

class InvalidAuthorization : ServerError(message = "Invalid authorization.", code = 400)
