# Tuturis

Tuturis is a self-hosted password manager written in C++, designed for security, performance, and full user control.  
It includes a lightweight HTML-based control panel accessible via a local HTTP server.
For the moment the project is in early development stage, but the goal is to provide a secure and efficient solution for managing passwords.

## 🛠️ Features

- 🚀 High-performance C++ backend
- 🔐 Secure password storage using Argon2 hashing
- 🌐 Integrated web server (Boost.Beast) for UI access
- 📂 User and admin control panel
- 🧠 Environment variable support via `cpp-dotenv`
- 🗃️ MySQL database integration
- 📦 Clean modular architecture


## ✅ How to Build

Make sure [vcpkg](https://github.com/microsoft/vcpkg) is installed and integrated with CMake.

### Dependencies
- Boost (asio, system, beast)
- MySQL client (unofficial-libmysql)
- cpp-dotenv
- Argon2

### Build Instructions (Windows, CLion)
```bash
# Clone the repository and go to the directory
git clone https://github.com/yourname/tuturis.git
cd tuturis

# Install dependencies via vcpkg (example)
vcpkg install boost-asio boost-system boost-beast
vcpkg install unofficial-libmysql argon2 cpp-dotenv

# Open with CLion/VsCode or run CMake manually
cmake -B build -DCMAKE_TOOLCHAIN_FILE=path/to/vcpkg.cmake
cmake --build build
```
## 🛠️ Next Steps

### Initial Setup

- [x] Cmake Base Configuration
- [x] Add dependencies using vcpkg
- [x] Using cpp-dotenv for environment variables
- [x] .env config file support

### Database Integration ( mySQL)

- [x] MySQL connection setup (SqlConnection class)
- [x] Send and receive data from the database

### User Interface (HTTP server using Boost.Beast)

- [x] Create a simple HTTP server using Boost.Beast
- [x] Serve static HTML files for the control panel
- [x] Login Page Frontend
- [x] Admin panel for managing users and passwords
- [x] Create User admin page style

### User management

- [x] Create User class
- [x] Hash users passwords using [Argon2](https://github.com/khovratovich/Argon2) before storing them
- [x] Manage User creation from admin Panel
- [ ] Manage User login from control panel ( in progress )
- [ ] Manage User deletion from admin Panel
- [ ] Manage User modification from admin Panel
- [ ] Manage User password reset from admin Panel
