#!/bin/bash
#
# docker compose run --rm bank101
#
# Database setup
DB_FILE="bank.db"

# Check if database exists, create if not
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
# Function to create a new account
create_account() {
  read -p "Enter account name: " name
  sqlite3 "$DB_FILE" "INSERT INTO accounts (name) VALUES ('$name');"
  echo "Account created for $name."
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
#
# This version of the withdraw() function uses a heredoc to pass the SQL commands to sqlite3. 
# Here are the key changes and benefits:
# The SQL statements are now enclosed between <<EOF and EOF, creating a heredoc.
# We've removed the quotes around the SQL statements, as they're no longer needed with a heredoc.
# Each SQL statement is on its own line, improving readability.
# Variables ($amount and $id) are still interpolated within the heredoc, maintaining the function's original behavior.
# The indentation of the SQL statements is preserved, making the code more readable.
# This heredoc approach offers the same benefits we discussed earlier: easier quoting, potential for better syntax 
# highlighting, and improved readability, especially for multi-line SQL statements.
# 
withdraw() {
  read -p "Enter account ID: " id
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
  read -p "Enter account ID: " id
  balance=$(sqlite3 "$DB_FILE" "SELECT balance FROM accounts WHERE id = $id;")
  echo "Account balance: $balance"
}

# Function to transfer money
transfer() {
  read -p "Enter source account ID: " source_id
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
}

# Function to view transaction history
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

  1. Create Account
  2. Deposit
  3. Withdraw
  4. Check Balance
  5. Transfer
  6. Print Tables (Debug)
  7. View Transaction History
  8. Exit
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
    8) exit 0 ;;
    *) echo "Invalid choice. Please try again." ;;
  esac
done