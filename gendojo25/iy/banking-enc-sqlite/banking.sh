#!/bin/bash

# Database setup
DB_FILE="bank.db"

ENC_DB_FILE="bank.db.age"

create_db_schema() {
# Check if the database file exists, create it if not
  if [ ! -f "$DB_FILE" ]; then
    sqlite3 "$DB_FILE" "
      CREATE TABLE accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0.0
      );
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER,
        dest_id INTEGER,
        amount REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );"
  fi
}

# Function to create a new account
create_account() {
  read -p "Enter account name: " name
  sqlite3 "$DB_FILE" "INSERT INTO accounts (name) VALUES ('$name');"
  echo "Account created for $name."
}

enc_dbfile() {
    # Check if AGE_PUB_KEY is set
    if [ -z "$AGE_PUB_KEY" ]; then
        echo "Error: AGE_PUB_KEY is not set. Please set the public key for encryption."
        echo "Usage: Generate an Age Key first."
        return 1
    else
        echo "Using AGE_PUB_KEY: $AGE_PUB_KEY"
    fi

    echo "Encrypting database file:"
    echo "Original file: $DB_FILE"
    echo "Original file size: $(du -h "$DB_FILE" | cut -f1)"
    echo "Encrypted file will be: $ENC_DB_FILE"
    
    # Encrypt the database file using age
    age -e -r $AGE_PUB_KEY -o $ENC_DB_FILE $DB_FILE
    
    echo "Encryption complete."
    echo "Encrypted file: $ENC_DB_FILE"
    echo "Encrypted file size: $(du -h "$ENC_DB_FILE" | cut -f1)"
    
    # Remove the original database file for security
    rm "$DB_FILE"
    echo "Original database file ($DB_FILE) has been removed."
}

dec_dbfile() {
    # Check if AGE_KEY_FILE exists
    if [ ! -f "$AGE_KEY_FILE" ]; then
        echo "Error: AGE_KEY_FILE does not exist or is not accessible."
        echo "Please ensure the key file exists and is readable."
        echo "Usage: Generate an Age Key first."
        return 1
    else
        echo "Using AGE_KEY_FILE: $AGE_KEY_FILE"
    fi

    echo "Decrypting database file:"
    echo "Encrypted file: $ENC_DB_FILE"
    echo "Encrypted file size: $(du -h "$ENC_DB_FILE" | cut -f1)"
    echo "Decrypted file will be: $DB_FILE"
    
    # Decrypt the database file using age
    age -d -i $AGE_KEY_FILE -o $DB_FILE $ENC_DB_FILE
    
    echo "Decryption complete."
    echo "Decrypted file: $DB_FILE"
    echo "Decrypted file size: $(du -h "$DB_FILE" | cut -f1)"
}

# Function to create an age key or prompt for overwrite if one already exists
create_age_key() {
    AGE_KEY_FILE="/tmp/age-keys.txt"
    echo "Creating an age encryption key and extracting the public key as AGE_PUB_KEY"
    # Generate a new age key
    age-keygen > "$AGE_KEY_FILE"
    # Set appropriate permissions for the key file
    chmod 400 "$AGE_KEY_FILE"
    # Extract the public key
    AGE_PUB_KEY=$(grep 'public key' "$AGE_KEY_FILE" | cut -d' ' -f 4)
    echo "Age key created successfully. Public key: $AGE_PUB_KEY"
}

# Function to deposit money
deposit() {
  read -p "Enter account ID: " id
  read -p "Enter amount to deposit: " amount
  sqlite3 "$DB_FILE" "BEGIN TRANSACTION;
                     UPDATE accounts SET balance = balance + $amount WHERE id = $id;
                     INSERT INTO transactions (source_id, dest_id, amount) VALUES (0, $id, $amount);
                     COMMIT;"
  echo "Deposit successful."
}

# Function to withdraw money
withdraw() {
  read -p "Enter account ID: " id
  read -p "Enter amount to withdraw: " amount
  sqlite3 "$DB_FILE" "BEGIN TRANSACTION;
                     UPDATE accounts SET balance = balance - $amount WHERE id = $id;
                     INSERT INTO transactions (source_id, dest_id, amount) VALUES ($id, 0, $amount); 
                     COMMIT;"
  echo "Withdrawal successful."
}

# Function to check the account balance
check_balance() {
  read -p "Enter account ID: " id
  balance=$(sqlite3 "$DB_FILE" "SELECT balance FROM accounts WHERE id = $id;")
  echo "Account balance: $balance"
}

# Function to transfer money between accounts
transfer() {
  read -p "Enter source account ID: " source_id
  read -p "Enter destination account ID: " dest_id
  read -p "Enter amount to transfer: " amount

  # Check if the source account has sufficient funds within the transaction
  sqlite3 "$DB_FILE" "BEGIN TRANSACTION;
                     SELECT balance FROM accounts WHERE id = $source_id;
                     "
  source_balance=$(sqlite3 "$DB_FILE" "SELECT balance FROM accounts WHERE id = $source_id;")
  if (( $(echo "$source_balance >= $amount" | bc -l) )); then
    # Deduct from the source account and add to the destination account
    sqlite3 "$DB_FILE" "UPDATE accounts SET balance = balance - $amount WHERE id = $source_id;
                     UPDATE accounts SET balance = balance + $amount WHERE id = $dest_id;
                     INSERT INTO transactions (source_id, dest_id, amount) VALUES ($source_id, $dest_id, $amount);
                     COMMIT;"
    echo "Transfer successful."
  else
    sqlite3 "$DB_FILE" "ROLLBACK;"
    echo "Insufficient funds in the source account."
  fi
}

# Function to print all tables (for debugging purposes)
print_tables() {
  echo "Accounts Table:"
  sqlite3 "$DB_FILE" ".headers on" ".mode column" "SELECT * FROM accounts;"
  echo "\nTransactions Table:"
  sqlite3 "$DB_FILE" ".headers on" ".mode column" "SELECT * FROM transactions;"
}

# Function to view the transaction history
view_transaction_history() {
  read -p "Enter account ID (or leave blank for all): " account_id

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

# Main menu loop
while true; do
  echo "
  Banking System Menu:

  1. Create Database Schema
  2. Create Account
  3. Deposit
  4. Withdraw
  5. Check Balance
  6. Transfer
  7. Print Tables (Debug)
  8. View Transaction History
  9. Encrypt Database File
  10. Decrypt Database File
  11. Create Age Key
  12. Exit
  "

  read -p "Enter your choice: " choice

  case $choice in
    1) create_db_schema ;;
    2) create_account ;;
    3) deposit ;;
    4) withdraw ;;
    5) check_balance ;;
    6) transfer ;;
    7) print_tables ;;
    8) view_transaction_history ;;
    9) enc_dbfile ;;
    10) dec_dbfile ;;
    11) create_age_key ;;
    12) exit 0 ;;
    *) echo "Invalid choice. Please try again." ;;
  esac
done
