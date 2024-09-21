#!/bin/bash

# Function to check if argon2 is installed
check_argon2() {
    if ! command -v argon2 &> /dev/null; then
        echo "Error: argon2 is not installed. Please install it using the following command:"
        echo "sudo apt-get install argon2"
        exit 1
    fi
}

# Check if argon2 is installed before proceeding
check_argon2

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