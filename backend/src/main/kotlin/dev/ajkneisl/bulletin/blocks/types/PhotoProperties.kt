package dev.ajkneisl.bulletin.blocks.types

enum class PhotoProperties(val type: ParameterType) {
    DEFAULT_QUALITY(ParameterType.STRING),
    LONG_DESCRIPTION(ParameterType.STRING),
}
