#include "PassKeysToDB.h"
#include <cstring>
#include <iostream>
#include <type_traits>
#include <stdexcept>
#include <dotenv.h>
#include "../external/json.hpp"
#include <cppcodec/base64_url_unpadded.hpp>
#include <cppcodec/base64_url.hpp>

namespace db {

using json = nlohmann::json;

static void set_error(MYSQL* conn, MYSQL_STMT* stmt, std::string* out_err) {
    if (!out_err) return;
    if (stmt) {
        const char* se = mysql_stmt_error(stmt);
        if (se && *se) { *out_err = se; return; }
    }
    const char* ce = mysql_error(conn);
    if (ce && *ce) { *out_err = ce; return; }
    *out_err = "MySQL unknown error";
}

bool mysql_connect_env(MYSQL** out_conn, std::string* out_err) {
    if (!out_conn) return false;
    auto& env = dotenv::env.load_dotenv();
    const char* host = env["MYSQL_HOST"].c_str();
    const char* user = env["MYSQL_USER"].c_str();
    const char* db_password = env["MYSQL_PASSWORD"].c_str();
    const char* database = env["MYSQL_DATABASE"].c_str();

    MYSQL* con = mysql_init(nullptr);
    if (!con) { if (out_err) *out_err = "mysql_init failed"; return false; }
    if (!mysql_real_connect(con, host, user, db_password, database, 0, nullptr, 0)) {
        if (out_err) *out_err = mysql_error(con);
        mysql_close(con);
        return false;
    }
    mysql_set_character_set(con, "utf8mb4");
    *out_conn = con;
    return true;
}

bool passkeys_insert(MYSQL* conn,
                     const PasskeyInsertParams& p,
                     uint64_t* out_insert_id,
                     std::string* out_err) {
    if (!conn) { if (out_err) *out_err = "conn is null"; return false; }
    static const char* kSql =
        "INSERT INTO passkeys "
        "(user_id, rp_id, credential_id, public_key, alg, sign_count, "
        " aaguid, transports, backup_eligible, backup_state, resident_key, user_verified, "
        " nickname, disabled) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    MYSQL_STMT* stmt = mysql_stmt_init(conn);
    if (!stmt) { set_error(conn, nullptr, out_err); return false; }
    if (mysql_stmt_prepare(stmt, kSql, static_cast<unsigned long>(std::strlen(kSql))) != 0) {
        set_error(conn, stmt, out_err); mysql_stmt_close(stmt); return false;
    }

    MYSQL_BIND bind[14]; std::memset(bind, 0, sizeof(bind));

    unsigned long long user_id_u64 = p.user_id;
    bind[0].buffer_type = MYSQL_TYPE_LONGLONG; bind[0].is_unsigned = 1; bind[0].buffer = &user_id_u64;

    unsigned long rp_len = static_cast<unsigned long>(p.rp_id.size());
    bind[1].buffer_type = MYSQL_TYPE_STRING; bind[1].buffer = const_cast<char*>(p.rp_id.data()); bind[1].buffer_length = rp_len; bind[1].length = &rp_len;

    unsigned long cred_len = static_cast<unsigned long>(p.credential_id.size());
    bind[2].buffer_type = MYSQL_TYPE_STRING; bind[2].buffer = const_cast<char*>(p.credential_id.data()); bind[2].buffer_length = cred_len; bind[2].length = &cred_len;

    unsigned long pk_len = static_cast<unsigned long>(p.public_key.size());
    bind[3].buffer_type = MYSQL_TYPE_BLOB; bind[3].buffer = const_cast<unsigned char*>(p.public_key.data()); bind[3].buffer_length = pk_len; bind[3].length = &pk_len;

    int alg = p.alg; bind[4].buffer_type = MYSQL_TYPE_LONG; bind[4].buffer = &alg;

    unsigned int sign_count_u = p.sign_count; bind[5].buffer_type = MYSQL_TYPE_LONG; bind[5].is_unsigned = 1; bind[5].buffer = &sign_count_u;

    using bind_is_null_t = std::remove_pointer_t<decltype(MYSQL_BIND{}.is_null)>;

    unsigned long aaguid_len = 0; bind_is_null_t aaguid_is_null = static_cast<bind_is_null_t>(1); std::array<uint8_t, 16> aaguid_buf{};
    if (p.aaguid.has_value()) { aaguid_buf = *p.aaguid; aaguid_len = 16; aaguid_is_null = static_cast<bind_is_null_t>(0); }
    bind[6].buffer_type = MYSQL_TYPE_BLOB; bind[6].buffer = p.aaguid ? const_cast<uint8_t*>(aaguid_buf.data()) : nullptr; bind[6].buffer_length = aaguid_len; bind[6].length = &aaguid_len; bind[6].is_null = &aaguid_is_null;

    unsigned long transports_len = 0; bind_is_null_t transports_is_null = static_cast<bind_is_null_t>(1); const char* transports_ptr = nullptr; std::string transports_storage;
    if (p.transports_json.has_value()) { transports_storage = *p.transports_json; transports_ptr = transports_storage.c_str(); transports_len = static_cast<unsigned long>(transports_storage.size()); transports_is_null = static_cast<bind_is_null_t>(0); }
    bind[7].buffer_type = MYSQL_TYPE_STRING; bind[7].buffer = const_cast<char*>(transports_ptr); bind[7].buffer_length = transports_len; bind[7].length = &transports_len; bind[7].is_null = &transports_is_null;

    auto set_optional_bool = [](MYSQL_BIND& b, const std::optional<bool>& v, bind_is_null_t& is_null, signed char& tiny_val) {
        if (v.has_value()) { tiny_val = (*v ? 1 : 0); is_null = static_cast<bind_is_null_t>(0); b.buffer_type = MYSQL_TYPE_TINY; b.buffer = &tiny_val; }
        else { is_null = static_cast<bind_is_null_t>(1); b.buffer_type = MYSQL_TYPE_TINY; b.buffer = nullptr; }
        b.is_null = &is_null;
    };
    bind_is_null_t be_is_null = static_cast<bind_is_null_t>(1); signed char be_val = 0; set_optional_bool(bind[8], p.backup_eligible, be_is_null, be_val);
    bind_is_null_t bs_is_null = static_cast<bind_is_null_t>(1); signed char bs_val = 0; set_optional_bool(bind[9], p.backup_state, bs_is_null, bs_val);
    bind_is_null_t rk_is_null = static_cast<bind_is_null_t>(1); signed char rk_val = 0; set_optional_bool(bind[10], p.resident_key, rk_is_null, rk_val);
    bind_is_null_t uv_is_null = static_cast<bind_is_null_t>(1); signed char uv_val = 0; set_optional_bool(bind[11], p.user_verified, uv_is_null, uv_val);

    unsigned long nick_len = 0; bind_is_null_t nick_is_null = static_cast<bind_is_null_t>(1); const char* nick_ptr = nullptr; std::string nick_storage;
    if (p.nickname.has_value()) { nick_storage = *p.nickname; nick_ptr = nick_storage.c_str(); nick_len = static_cast<unsigned long>(nick_storage.size()); nick_is_null = static_cast<bind_is_null_t>(0); }
    bind[12].buffer_type = MYSQL_TYPE_STRING; bind[12].buffer = const_cast<char*>(nick_ptr); bind[12].buffer_length = nick_len; bind[12].length = &nick_len; bind[12].is_null = &nick_is_null;

    signed char disabled_val = p.disabled ? 1 : 0; bind[13].buffer_type = MYSQL_TYPE_TINY; bind[13].buffer = &disabled_val;

    if (mysql_stmt_bind_param(stmt, bind) != 0) { set_error(conn, stmt, out_err); mysql_stmt_close(stmt); return false; }
    if (mysql_stmt_execute(stmt) != 0) { set_error(conn, stmt, out_err); mysql_stmt_close(stmt); return false; }

    if (out_insert_id) { unsigned long long id = mysql_stmt_insert_id(stmt); *out_insert_id = static_cast<uint64_t>(id); }
    mysql_stmt_close(stmt);
    return true;
}

bool passkeys_insert_minimal(MYSQL* conn,
                             uint64_t user_id,
                             const std::string& rp_id,
                             const std::string& credential_id,
                             const std::vector<uint8_t>& public_key,
                             int alg,
                             uint32_t sign_count,
                             uint64_t* out_insert_id,
                             std::string* out_err) {
    PasskeyInsertParams p;
    p.user_id = user_id;
    p.rp_id = rp_id;
    p.credential_id = credential_id;
    p.public_key = public_key;
    p.alg = alg;
    p.sign_count = sign_count;
    p.disabled = false;
    return passkeys_insert(conn, p, out_insert_id, out_err);
}

bool passkeys_update_sign_count(MYSQL* conn,
                                const std::string& credential_id,
                                uint32_t new_sign_count,
                                std::string* out_err) {
    if (!conn) { if (out_err) *out_err = "conn is null"; return false; }
    static const char* kSql =
        "UPDATE passkeys "
        "SET sign_count = ?, last_used_at = CURRENT_TIMESTAMP "
        "WHERE credential_id = ? AND disabled = 0";

    MYSQL_STMT* stmt = mysql_stmt_init(conn);
    if (!stmt) { set_error(conn, nullptr, out_err); return false; }
    if (mysql_stmt_prepare(stmt, kSql, static_cast<unsigned long>(std::strlen(kSql))) != 0) {
        set_error(conn, stmt, out_err); mysql_stmt_close(stmt); return false; }

    MYSQL_BIND bind[2]; std::memset(bind, 0, sizeof(bind));
    unsigned int sc = new_sign_count; bind[0].buffer_type = MYSQL_TYPE_LONG; bind[0].is_unsigned = 1; bind[0].buffer = &sc;

    unsigned long cred_len = static_cast<unsigned long>(credential_id.size());
    bind[1].buffer_type = MYSQL_TYPE_STRING; bind[1].buffer = const_cast<char*>(credential_id.data()); bind[1].buffer_length = cred_len; bind[1].length = &cred_len;

    if (mysql_stmt_bind_param(stmt, bind) != 0) { set_error(conn, stmt, out_err); mysql_stmt_close(stmt); return false; }
    if (mysql_stmt_execute(stmt) != 0) { set_error(conn, stmt, out_err); mysql_stmt_close(stmt); return false; }

    my_ulonglong affected = mysql_stmt_affected_rows(stmt);
    mysql_stmt_close(stmt);
    return affected > 0;
}

static std::vector<uint8_t> b64url_decode(const std::string& s) {
    try { return cppcodec::base64_url_unpadded::decode<std::vector<uint8_t>>(s); }
    catch (...) { return cppcodec::base64_url::decode<std::vector<uint8_t>>(s); }
}

static uint16_t be16(const uint8_t* p) {
    return static_cast<uint16_t>(static_cast<uint16_t>(p[0]) << 8 | static_cast<uint16_t>(p[1]));
}

static uint32_t be32(const uint8_t* p) {
    return (static_cast<uint32_t>(p[0]) << 24) |
           (static_cast<uint32_t>(p[1]) << 16) |
           (static_cast<uint32_t>(p[2]) << 8)  |
            static_cast<uint32_t>(p[3]);
}

struct ParsedAuthData {
    std::array<uint8_t,32> rpIdHash{};
    uint8_t flags = 0;
    uint32_t signCount = 0;
    bool hasAttestedCredData = false;
    std::array<uint8_t,16> aaguid{};
    std::vector<uint8_t> credentialId;
    std::vector<uint8_t> cosePublicKeyCbor;
};

static bool json_binary_to_vector(const json& j, std::vector<uint8_t>& out) {
    if (j.is_binary()) {
        auto& bin = j.get_binary(); // versions récentes: référence
        out.assign(bin.begin(), bin.end());
        return true;
    }
    if (j.is_array()) {
        out.reserve(j.size());
        for (const auto& v : j) out.push_back(v.get<uint8_t>());
        return true;
    }
    if (j.is_string()) {
        out = b64url_decode(j.get<std::string>());
        return true;
    }
    return false;
}


namespace cbor {

static bool read_uint(const std::vector<uint8_t>& b, size_t& pos, uint8_t ai, uint64_t& out) {
    if (ai < 24) { out = ai; return true; }
    if (ai == 24) { if (pos + 1 > b.size()) return false; out = b[pos++]; return true; }
    if (ai == 25) { if (pos + 2 > b.size()) return false; out = (uint64_t(b[pos])<<8) | b[pos+1]; pos += 2; return true; }
    if (ai == 26) { if (pos + 4 > b.size()) return false; out = (uint64_t(b[pos])<<24)|(uint64_t(b[pos+1])<<16)|(uint64_t(b[pos+2])<<8)|b[pos+3]; pos += 4; return true; }
    if (ai == 27) { if (pos + 8 > b.size()) return false; uint64_t v=0; for(int i=0;i<8;i++) v=(v<<8)|b[pos+i]; pos+=8; return true; }
    return false;
}

static bool read_head(const std::vector<uint8_t>& b, size_t& pos, uint8_t& major, uint8_t& ai) {
    if (pos >= b.size()) return false;
    uint8_t ib = b[pos++];
    major = (ib >> 5) & 0x07;
    ai = ib & 0x1f;
    return true;
}

static bool skip_item(const std::vector<uint8_t>& b, size_t& pos); // fwd

static bool read_tstr(const std::vector<uint8_t>& b, size_t& pos, std::string& out) {
    uint8_t major, ai; if (!read_head(b, pos, major, ai)) return false;
    if (major != 3) return false;
    uint64_t len; if (!read_uint(b, pos, ai, len)) return false;
    if (pos + len > b.size()) return false;
    out.assign(reinterpret_cast<const char*>(&b[pos]), reinterpret_cast<const char*>(&b[pos + len]));
    pos += static_cast<size_t>(len);
    return true;
}

static bool read_bstr(const std::vector<uint8_t>& b, size_t& pos, std::vector<uint8_t>& out) {
    uint8_t major, ai; if (!read_head(b, pos, major, ai)) return false;
    if (major != 2) return false;
    uint64_t len; if (!read_uint(b, pos, ai, len)) return false;
    if (pos + len > b.size()) return false;
    out.assign(b.begin() + pos, b.begin() + pos + static_cast<size_t>(len));
    pos += static_cast<size_t>(len);
    return true;
}

static bool skip_item(const std::vector<uint8_t>& b, size_t& pos) {
    uint8_t major, ai; if (!read_head(b, pos, major, ai)) return false;
    if (major == 0 || major == 1) {
        uint64_t v; return read_uint(b, pos, ai, v);
    } else if (major == 2 || major == 3) {
        uint64_t len; if (!read_uint(b, pos, ai, len)) return false;
        if (pos + len > b.size()) return false;
        pos += static_cast<size_t>(len);
        return true;
    } else if (major == 4) {
        uint64_t len; if (!read_uint(b, pos, ai, len)) return false;
        for (uint64_t i = 0; i < len; ++i) { if (!skip_item(b, pos)) return false; }
        return true;
    } else if (major == 5) {
        uint64_t len; if (!read_uint(b, pos, ai, len)) return false;
        for (uint64_t i = 0; i < len; ++i) { if (!skip_item(b, pos)) return false; if (!skip_item(b, pos)) return false; }
        return true;
    } else if (major == 6) {
        return skip_item(b, pos);
    } else {
        if (ai < 24) return true;
        if (ai == 24) { if (pos + 1 > b.size()) return false; pos += 1; return true; }
        if (ai == 25) { if (pos + 2 > b.size()) return false; pos += 2; return true; }
        if (ai == 26) { if (pos + 4 > b.size()) return false; pos += 4; return true; }
        if (ai == 27) { if (pos + 8 > b.size()) return false; pos += 8; return true; }
        return false;
    }
}

static bool extract_authData(const std::vector<uint8_t>& b, std::vector<uint8_t>& out) {
    size_t pos = 0;
    uint8_t major, ai;
    if (!read_head(b, pos, major, ai)) return false;
    if (major != 5) return false; // map
    uint64_t mapLen; if (!read_uint(b, pos, ai, mapLen)) return false;

    for (uint64_t i = 0; i < mapLen; ++i) {
        size_t keyPos = pos;
        std::string key;
        if (!read_tstr(b, pos, key)) {
            pos = keyPos;
            if (!skip_item(b, pos)) return false;
            if (!skip_item(b, pos)) return false;
            continue;
        }
        if (key == "authData") {
            if (!read_bstr(b, pos, out)) return false;
            // skip rest
            for (uint64_t j = i + 1; j < mapLen; ++j) {
                if (!skip_item(b, pos)) return false;
                if (!skip_item(b, pos)) return false;
            }
            return true;
        } else {
            if (!skip_item(b, pos)) return false;
        }
    }
    return false;
}

} // namespace cbor

static ParsedAuthData parse_auth_data(const std::vector<uint8_t>& authData) {
    if (authData.size() < 37) throw std::runtime_error("authData too short");
    ParsedAuthData out;
    std::memcpy(out.rpIdHash.data(), authData.data(), 32);
    out.flags = authData[32];
    out.signCount = be32(&authData[33]);

    size_t pos = 37;
    bool at = (out.flags & 0x40) != 0;
    if (at) {
        if (authData.size() < pos + 16 + 2) throw std::runtime_error("authData missing aaguid/len");
        std::memcpy(out.aaguid.data(), &authData[pos], 16); pos += 16;

        uint16_t credIdLen = be16(&authData[pos]); pos += 2;
        if (authData.size() < pos + credIdLen) throw std::runtime_error("authData credId truncated");
        out.credentialId.assign(&authData[pos], &authData[pos + credIdLen]); pos += credIdLen;

        if (authData.size() <= pos) throw std::runtime_error("authData missing COSE key");
        out.cosePublicKeyCbor.assign(&authData[pos], &authData.back() + 1);
        out.hasAttestedCredData = true;
    }
    return out;
}

static int extract_cose_alg(const std::vector<uint8_t>& coseCbor) {
    try {
        json j = json::from_cbor(coseCbor);
        if (j.is_object()) {
            auto it = j.find("3"); // COSE label 3 = alg
            if (it != j.end() && it->is_number_integer()) return it->get<int>();
        }
    } catch (...) {}
    return 0;
}

bool insert_passkey_from_registration_json(MYSQL* conn,
                                           uint64_t user_id,
                                           const std::string& rp_id,
                                           const std::string& body_json,
                                           uint64_t* out_passkey_id,
                                           std::string* out_err) {
    if (!conn) { if (out_err) *out_err = "conn is null"; return false; }

    json root = json::parse(body_json);
    const json body = root.contains("credential") ? root.at("credential") : root;
    const json& resp = body.at("response");

    const std::string att_b64url = resp.at("attestationObject").get<std::string>();
    std::vector<uint8_t> attestationObj = b64url_decode(att_b64url);

    std::cerr << "[webauthn] attestationObject b64 length: " << att_b64url.size() << "\n";
    std::cerr << "[webauthn] attestationObject decoded size: " << attestationObj.size() << "\n";
    if (!attestationObj.empty()) {
        std::cerr << "[webauthn] attestationObject first bytes: ";
        for (size_t i = 0; i < std::min<size_t>(16, attestationObj.size()); ++i)
            std::cerr << std::hex << (int)attestationObj[i] << " ";
        std::cerr << std::dec << "\n";
    }

    if (attestationObj.empty()) {
        if (out_err) *out_err = "attestationObj is empty after decoding!";
        return false;
    }

    std::vector<uint8_t> authData;
    bool gotAuthData = cbor::extract_authData(attestationObj, authData);

    // 2) Fallback via nlohmann::json
    if (!gotAuthData) {
        std::cerr << "[webauthn] Direct CBOR extraction failed, trying nlohmann::json::from_cbor...\n";
        try {
            json att = json::from_cbor(attestationObj);
            if (!att.contains("authData")) {
                if (out_err) *out_err = "CBOR parse error: missing authData field";
                return false;
            }
            if (!json_binary_to_vector(att["authData"], authData)) {
                if (out_err) *out_err = "CBOR parse error: authData wrong type";
                return false;
            }
        } catch (const std::exception& e) {
            if (out_err) *out_err = std::string("CBOR parse error: ") + e.what();
            return false;
        }
    }

    std::cerr << "[webauthn] authData size: " << authData.size() << "\n";
    if (authData.size() >= 16) {
        std::cerr << "[webauthn] authData first bytes: ";
        for (size_t i = 0; i < 16; ++i) std::cerr << std::hex << (int)authData[i] << " ";
        std::cerr << std::dec << "\n";
    }

    try {
        ParsedAuthData parsed = parse_auth_data(authData);
        int alg = extract_cose_alg(parsed.cosePublicKeyCbor);

        std::optional<std::string> transports_json;
        if (resp.contains("transports") && !resp["transports"].is_null())
            transports_json = resp["transports"].dump();

        std::optional<bool> resident_key;
        if (body.contains("clientExtensionResults") &&
            body["clientExtensionResults"].contains("credProps") &&
            body["clientExtensionResults"]["credProps"].contains("rk")) {
            resident_key = body["clientExtensionResults"]["credProps"]["rk"].get<bool>();
        }

        std::optional<bool> user_verified = static_cast<bool>(parsed.flags & 0x04);

        PasskeyInsertParams p;
        p.user_id = user_id;
        p.rp_id = rp_id;
        p.credential_id = body.at("rawId").get<std::string>();
        p.public_key = parsed.cosePublicKeyCbor;
        p.alg = alg;
        p.sign_count = parsed.signCount;
        p.aaguid = parsed.aaguid;
        p.transports_json = transports_json;
        p.resident_key = resident_key;
        p.user_verified = user_verified;
        p.disabled = false;

        return passkeys_insert(conn, p, out_passkey_id, out_err);
    } catch (const std::exception& e) {
        if (out_err) *out_err = std::string("Parse authData error: ") + e.what();
        return false;
    }
}

} // namespace db