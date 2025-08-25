#pragma once
#include <mysql/mysql.h>
#include <string>
#include <vector>
#include <array>
#include <optional>
#include <cstdint>

namespace db {

struct PasskeyInsertParams {
    uint64_t user_id;
    std::string rp_id;
    std::string credential_id;
    std::vector<uint8_t> public_key;
    int alg;
    uint32_t sign_count;
    std::optional<std::array<uint8_t, 16>> aaguid;
    std::optional<std::string> transports_json;
    std::optional<bool> backup_eligible;
    std::optional<bool> backup_state;
    std::optional<bool> resident_key;
    std::optional<bool> user_verified;
    std::optional<std::string> nickname;
    bool disabled = false;
};

bool mysql_connect_env(MYSQL** out_conn, std::string* out_err = nullptr);

bool passkeys_insert(MYSQL* conn,
                     const PasskeyInsertParams& p,
                     uint64_t* out_insert_id = nullptr,
                     std::string* out_err = nullptr);

bool passkeys_insert_minimal(MYSQL* conn,
                             uint64_t user_id,
                             const std::string& rp_id,
                             const std::string& credential_id,
                             const std::vector<uint8_t>& public_key,
                             int alg,
                             uint32_t sign_count,
                             uint64_t* out_insert_id = nullptr,
                             std::string* out_err = nullptr);

bool passkeys_update_sign_count(MYSQL* conn,
                                const std::string& credential_id,
                                uint32_t new_sign_count,
                                std::string* out_err = nullptr);

bool insert_passkey_from_registration_json(MYSQL* conn,
                                           uint64_t user_id,
                                           const std::string& rp_id,
                                           const std::string& body_json,
                                           uint64_t* out_passkey_id = nullptr,
                                           std::string* out_err = nullptr);

} // namespace db