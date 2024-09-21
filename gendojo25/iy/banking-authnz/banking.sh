#!/bin/bash

# Check if argon2 is installed
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
DB_FILE="bank.db"

# Create the database and tables if they don't exist
sqlite3 "$DB_FILE" <<EOF
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    balance REAL DEFAULT 0.0,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL,
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    dest_id INTEGER,
    amount REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    success INTEGER NOT NULL
);
EOF

# Function to generate a random salt
generate_salt() {
  head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16
  echo
}

# Function to create a new account
create_account() {
  read -p "Enter account name: " name
  read -sp "Enter password: " password
  echo

  # Generate a random salt
  salt=$(generate_salt)

  # Hash the password using Argon2id
  hash=$(echo -n "$password" | argon2 "$salt" -id -l 32 -r)

  # Insert account data into the database
  sqlite3 "$DB_FILE" "INSERT INTO accounts (name, salt, hash) VALUES ('$name', '$salt', '$hash');"

  echo "Account created for $name."
}

# Function to deposit money
deposit() {
  # Requires authentication
  if ! authenticate_user; then
    return 1
  fi

  read -p "Enter account ID: " id
  # Authorize user to access this account
  if ! authorize_user "$id"; then
    echo "You are not authorized to make a deposit."
    return 1
  fi
  read -p "Enter amount to deposit: " amount
  sqlite3 "$DB_FILE" "BEGIN TRANSACTION;
                     UPDATE accounts SET balance = balance + $amount WHERE id = $id;
                     INSERT INTO transactions (source_id, dest_id, amount) VALUES (0, $id, $amount);
                     COMMIT;"
  echo "Deposit successful."
}

# Function to withdraw money
withdraw() {
  # Requires authentication
  if ! authenticate_user; then
    return 1
  fi

  read -p "Enter account ID: " id
  # Authorize user to access this account
  if ! authorize_user "$id"; then
    echo "You are not authorized to make a withdrawal."
    return 1
  fi
  read -p "Enter amount to withdraw: " amount

  sqlite3 "$DB_FILE" <<EOF
    BEGIN TRANSACTION;
    UPDATE accounts SET balance = balance - $amount WHERE id = $id;
    INSERT INTO transactions (source_id, dest_id, amount) VALUES ($id, 0, $amount);
    COMMIT;
EOF

  echo "Withdrawal successful."
}

# Function to check balance
check_balance() {
  # Requires authentication
  if ! authenticate_user; then
    return 1
  fi

  read -p "Enter account ID: " id
  # Authorize user to access this account
  if ! authorize_user "$id"; then
    echo "You are not authorized to check this account's balance."
    return 1
  fi
  balance=$(sqlite3 "$DB_FILE" "SELECT balance FROM accounts WHERE id = $id;")
  echo "Account balance: $balance"
}

# Function to transfer money
transfer() {
  # Requires authentication
  if ! authenticate_user; then
    return 1
  fi

  read -p "Enter source account ID: " source_id
  # Authorize user to access this account
  if ! authorize_user "$source_id"; then
    echo "You are not authorized to make a transfer."
    return 1
  fi
  read -p "Enter destination account ID: " dest_id
  read -p "Enter amount to transfer: " amount

  # Check if source account has sufficient funds within the transaction
  sqlite3 "$DB_FILE" "BEGIN TRANSACTION;
                     SELECT balance FROM accounts WHERE id = $source_id;
                     "
  source_balance=$(sqlite3 "$DB_FILE" "SELECT balance FROM accounts WHERE id = $source_id;")
  if (( $(echo "$source_balance >= $amount" | bc -l) )); then
    # Deduct from source account
    sqlite3 "$DB_FILE" "UPDATE accounts SET balance = balance - $amount WHERE id = $source_id;
                     UPDATE accounts SET balance = balance + $amount WHERE id = $dest_id;
                     INSERT INTO transactions (source_id, dest_id, amount) VALUES ($source_id, $dest_id, $amount);
                     COMMIT;"
    echo "Transfer successful."
  else
    sqlite3 "$DB_FILE" "ROLLBACK;"
    echo "Insufficient funds in source account."
  fi
}

# Function to print all tables
print_tables() {
  echo "Accounts Table:"
  sqlite3 "$DB_FILE" ".headers on" ".mode column" "SELECT * FROM accounts;"
  echo "\nTransactions Table:"
  sqlite3 "$DB_FILE" ".headers on" ".mode column" "SELECT * FROM transactions;"
  echo "\nAuthentication Events Table:"
  sqlite3 "$DB_FILE" ".headers on" ".mode column" "SELECT * FROM auth_events;"
}

# Function to update a user's password
update_password() {
  # Requires authentication
  if ! authenticate_user; then
    return 1
  fi

  read -p "Enter account name: " username

  # Check if the user exists
  if [[ -z $(sqlite3 "$DB_FILE" "SELECT 1 FROM accounts WHERE name = '$username';") ]]; then
    echo "Account not found."
    return 1
  fi

  read -sp "Enter new password: " password
  echo

  # Generate a new salt
  salt=$(generate_salt)

  # Hash the new password using Argon2id
  hash=$(echo -n "$password" | argon2 "$salt" -id -l 32 -r)

  # Update the user's password in the database
  sqlite3 "$DB_FILE" "UPDATE accounts SET salt = '$salt', hash = '$hash' WHERE name = '$username';"

  echo "Password updated successfully."
}

# Function to view transaction history
view_transaction_history() {
  # Requires authentication
  if ! authenticate_user; then
    return 1
  fi

  read -p "Enter account ID (or leave blank to view all): " account_id

  # Authorize user to access this account
  if ! authorize_user "$account_id"; then
    echo "You are not authorized to view transaction history."
    return 1
  fi

  if [ -z "$account_id" ]; then
    # Show all transactions
    echo "Transaction History (All Accounts):"
    sqlite3 "$DB_FILE" ".headers on" ".mode column" "SELECT * FROM transactions;"
  else
    # Show transactions for the specified account
    echo "Transaction History (Account $account_id):"
    sqlite3 "$DB_FILE" ".headers on" ".mode column" \
      "SELECT * FROM transactions WHERE source_id = $account_id OR dest_id = $account_id;"
  fi
}

# Function to authorize a user to access an account
authorize_user() {
  local account_id=$1
  # Get the owner of the account
  owner=$(sqlite3 "$DB_FILE" "SELECT name FROM accounts WHERE id = $account_id;")
  # Check if the authenticated user is the owner of the account
  if [[ "$username" == "$owner" ]]; then
    return 0 # Authorized
  else
    return 1 # Not authorized
  fi
}

# Function to authenticate a user
authenticate_user() {
  read -p "Enter account name: " username
  read -sp "Enter password: " password
  echo

  # Get the salt and hash from the database
  salt=$(sqlite3 "$DB_FILE" "SELECT salt FROM accounts WHERE name = '$username';")
  stored_hash=$(sqlite3 "$DB_FILE" "SELECT hash FROM accounts WHERE name = '$username';")

  # Check if the user exists
  if [[ -z "$salt" ]]; then
    echo "Authentication failed: Account not found."
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
  Banking System Menu:

  1. Create Account
  2. Deposit Funds
  3. Withdraw Funds
  4. Check Balance
  5. Transfer Funds
  6. Print Tables (Debug)
  7. View Transaction History
  8. Authenticate User
  9. Update Password
  10. Exit
  "

  read -p "Enter your choice: " choice

  case $choice in
    1) create_account ;;
    2) deposit ;;
    3) withdraw ;;
    4) check_balance ;;
    5) transfer ;;
    6) print_tables ;;
    7) view_transaction_history ;;
    8) authenticate_user ;;
    9) update_password ;;
    10) exit 0 ;;
    *) echo "Invalid choice. Please try again." ;;
  esac
done 