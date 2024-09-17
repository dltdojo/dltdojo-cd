# testing

```sh
$ docker compose build
$ docker compose up -d
$ docker compose exec app101 bash app.sh
$ docker compose down
```

# prompts

## 101

```sh
$ argon2 -h
Usage:  argon2 [-h] salt [-i|-d|-id] [-t iterations] [-m log2(memory in KiB) | -k memory in KiB] [-p parallelism] [-l hash length] [-e|-r] [-v (10|13)]
	Password is read from stdin
Parameters:
	salt		The salt to use, at least 8 characters
	-i		Use Argon2i (this is the default)
	-d		Use Argon2d instead of Argon2i
	-id		Use Argon2id instead of Argon2i
	-t N		Sets the number of iterations to N (default = 3)
	-m N		Sets the memory usage of 2^N KiB (default 12)
	-k N		Sets the memory usage of N KiB (default 4096)
	-p N		Sets parallelism to N threads (default 1)
	-l N		Sets hash output length to N bytes (default 32)
	-e		Output only encoded hash
	-r		Output only the raw bytes of the hash
	-v (10|13)	Argon2 version (defaults to the most recent version, currently 13)
	-h		Print argon2 usage

$ echo -n "hashThis" | argon2 saltIt12345 -id -l 32 -r 
a59b0ce7f6c117c9acaf6d55107697a0b446f65f94fa2dac89280cf69abfc11d
```

Create a bash script for a simple user authentication system using SQLite and the argon2 command-line tool. 

The script should:

- Store user data (username, salt, argon2id hash) in an SQLite database named "users.db".
- Have functions for:
    - `add_user`: Add a new user to the database, prompting for username and password. Generate a random salt for each user.
    - `authenticate_user`: Authenticate a user by prompting for username and password, comparing the entered password's hash with the stored hash. 
    - `update_password`: Update a user's password, generating a new salt.
    - `debug_print_tables`: Print the contents of the database tables for debugging.
- Implement a menu-driven interface to allow the user to choose these actions.
- Log all authentication events (successful and unsuccessful) with timestamps in a separate table named "auth_events" in the same database.

Use best practices for password security, including Argon2id for hashing and dynamic salt generation. 

```bash
#!/bin/bash

# Database file
DB_FILE="users.db"

# Create the database and tables if they don't exist
sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL
);"

sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS auth_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    success INTEGER NOT NULL
);"

# Function to generate a random salt
generate_salt() {
  head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16
  echo
}

# Function to add a new user
add_user() {
  read -p "Enter username: " username
  read -sp "Enter password: " password
  echo

  # Generate a random salt
  salt=$(generate_salt)

  # Hash the password using Argon2id
  hash=$(echo -n "$password" | argon2 "$salt" -id -l 32 -r)

  # Insert user data into the database
  sqlite3 "$DB_FILE" "INSERT INTO users (username, salt, hash) VALUES ('$username', '$salt', '$hash');"

  echo "User '$username' added successfully."
}

# Function to authenticate a user
authenticate_user() {
  read -p "Enter username: " username
  read -sp "Enter password: " password
  echo

  # Get the salt and hash from the database
  salt=$(sqlite3 "$DB_FILE" "SELECT salt FROM users WHERE username = '$username';")
  stored_hash=$(sqlite3 "$DB_FILE" "SELECT hash FROM users WHERE username = '$username';")

  # Check if the user exists
  if [[ -z "$salt" ]]; then
    echo "Authentication failed: User not found."
    log_auth_event "$username" 0 # Log unsuccessful attempt
    return 1
  fi

  # Hash the entered password with the stored salt
  entered_hash=$(echo -n "$password" | argon2 "$salt" -id -l 32 -r)

  # Compare the hashes
  if [[ "$entered_hash" == "$stored_hash" ]]; then
    echo "Authentication successful!"
    log_auth_event "$username" 1 # Log successful attempt
    return 0
  else
    echo "Authentication failed: Incorrect password."
    log_auth_event "$username" 0 # Log unsuccessful attempt
    return 1
  fi
}

# Function to update a user's password
update_password() {
  read -p "Enter username: " username

  # Check if the user exists
  if [[ -z $(sqlite3 "$DB_FILE" "SELECT 1 FROM users WHERE username = '$username';") ]]; then
    echo "User not found."
    return 1
  fi

  read -sp "Enter new password: " password
  echo

  # Generate a new salt
  salt=$(generate_salt)

  # Hash the new password using Argon2id
  hash=$(echo -n "$password" | argon2 "$salt" -id -l 32 -r)

  # Update the user's password in the database
  sqlite3 "$DB_FILE" "UPDATE users SET salt = '$salt', hash = '$hash' WHERE username = '$username';"

  echo "Password updated successfully."
}


# Function to print the contents of the database tables
debug_print_tables() {
  echo "Users table:"
  sqlite3 "$DB_FILE" "SELECT * FROM users;"

  echo "\nAuthentication Events table:"
  sqlite3 "$DB_FILE" "SELECT * FROM auth_events;"
}


# Function to log authentication events
log_auth_event() {
  username="$1"
  success="$2" # 1 for success, 0 for failure
  timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  sqlite3 "$DB_FILE" "INSERT INTO auth_events (username, timestamp, success) VALUES ('$username', '$timestamp', '$success');"
}

# Main menu loop
while true; do
  echo "
  Menu:
  1. Add user
  2. Authenticate user
  3. Update password
  4. Debug: Print database tables
  5. Exit
  "
  read -p "Enter your choice: " choice

  case "$choice" in
    1) add_user ;;
    2) authenticate_user ;;
    3) update_password ;;
    4) debug_print_tables ;;
    5) exit 0 ;;
    *) echo "Invalid choice." ;;
  esac
done
```

**How to use:**

1.  **Save the script:** Save the code above as a `.sh` file (e.g., `auth.sh`).
2.  **Make it executable:** `chmod +x auth.sh`
3.  **Run the script:** `./auth.sh`

**Explanation:**

-   **Database Setup:** The script creates an SQLite database file (`users.db`) and two tables: `users` (to store user data) and `auth_events` (to log authentication attempts).
-   **Functions:**
    -   `generate_salt`: Generates a random 16-character alphanumeric salt.
    -   `add_user`: Prompts for username and password, generates a salt, hashes the password using Argon2id, and stores the data in the `users` table.
    -   `authenticate_user`: Prompts for username and password, retrieves the stored salt and hash, rehashes the entered password, and compares the hashes for authentication.
    -   `update_password`: Prompts for username and new password, generates a new salt, hashes the new password, and updates the database.
    -   `debug_print_tables`: Prints the contents of the database tables for debugging.
    -   `log_auth_event`: Logs authentication attempts (username, timestamp, success/failure) in the `auth_events` table.
-   **Menu:** The script presents a menu-driven interface to allow the user to choose different actions.
-   **Security:**
    -   **Argon2id:** The script uses Argon2id, a recommended key derivation function for password hashing, providing strong resistance against various attacks.
    -   **Dynamic Salt:** A unique random salt is generated for each user, preventing rainbow table attacks.
    -   **Secure Password Input:** The `read -sp` command is used to prevent the password from being displayed on the screen while typing.
-   **Logging:** All authentication events are logged with timestamps, which is important for security auditing.

