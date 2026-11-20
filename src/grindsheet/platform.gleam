/// Browser helpers. Progress is never written here. The passphrase and the
/// theme choice are kept in local storage, so each browser asks only once.
@external(javascript, "./platform_ffi.mjs", "readPassphrase")
pub fn read_passphrase() -> String

@external(javascript, "./platform_ffi.mjs", "writePassphrase")
pub fn write_passphrase(value: String) -> Nil

@external(javascript, "./platform_ffi.mjs", "decodeBase64")
pub fn decode_base64(value: String) -> String

@external(javascript, "./platform_ffi.mjs", "toggleTheme")
pub fn toggle_theme() -> Nil
