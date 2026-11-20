/// Browser helpers. Progress is never written here. The passphrase is kept
/// for this tab only, so a refresh does not ask for it again.
@external(javascript, "./platform_ffi.mjs", "readPassphrase")
pub fn read_passphrase() -> String

@external(javascript, "./platform_ffi.mjs", "writePassphrase")
pub fn write_passphrase(value: String) -> Nil

@external(javascript, "./platform_ffi.mjs", "decodeBase64")
pub fn decode_base64(value: String) -> String
