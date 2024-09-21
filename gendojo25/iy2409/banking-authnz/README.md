# Simple Banking System in Bash with SQLite and Argon2

This script implements a basic banking system using Bash scripting, SQLite for data storage, and Argon2 for password hashing. It provides functionality for creating accounts, depositing and withdrawing funds, checking balances, transferring money, viewing transaction history, and updating passwords.

## Features

* **Account Creation:** Allows users to create new accounts with unique names and passwords.
* **Password Hashing:** Uses Argon2id for secure password hashing, ensuring that passwords are not stored in plaintext.
* **Deposit/Withdrawal:** Facilitates depositing and withdrawing funds from accounts.
* **Balance Check:** Enables users to check their account balances.
* **Fund Transfer:** Allows users to transfer funds between accounts.
* **Transaction History:** Provides a view of transaction history for individual accounts or all accounts.
* **Password Update:** Allows users to update their account passwords.
* **Authentication:** Requires users to authenticate with their username and password before accessing account-specific functions.
* **Authorization:** Implements authorization to ensure that only account owners can access their own data.


## Prerequisites

- Docker
- Docker Compose

## File Structure

- `compose.yaml`: Docker Compose configuration file
- `Dockerfile`: Docker image definition for the banking application
- `banking.sh`: Main Bash script containing the banking system logic

## How to Run

1. Make sure you have Docker and Docker Compose installed on your system.
2. Clone this repository or ensure you have all the files in the same directory.
3. Open a terminal and navigate to the project directory.
4. Run the following command to start the application:

   ```
   docker compose run --rm bank101
   ```

## Usage

1. **Dependencies:**
   - **argon2:** The Argon2 password hashing utility. Install it using your system's package manager (e.g., `sudo apt-get install argon2` on Debian/Ubuntu).
   - **sqlite3:** The SQLite3 command-line tool. It's typically pre-installed on most Linux distributions.

2. **Run the Script:**
   ```bash
   bash banking_system.sh 
   ```

3. **Interact with the Menu:**
   The script presents a menu with the following options:
   ```
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
   ```

4. **Follow the Prompts:**
   Select the desired option by entering the corresponding number and follow the prompts provided by the script.

## Database

The script uses an SQLite database file named `bank.db` to store account information, transaction history, and authentication events. The database schema includes the following tables:

* **accounts:** Stores account details (ID, name, balance, salt, hash).
* **transactions:** Records all transactions (ID, source_id, dest_id, amount, timestamp).
* **auth_events:** Logs authentication attempts (ID, username, timestamp, success).

## AuthNZ (authentication and authorization)

**1. Authentication (Verifying User Identity)**

   - **`authenticate_user()` function:** This is the core function for authentication. 
   - **Username and Password Input:**  It prompts the user to enter their account name (username) and password.
   - **Retrieve Salt and Stored Hash:** It queries the `accounts` table in the SQLite database to fetch the salt and the Argon2 hash associated with the entered username.
   - **Hashing the Entered Password:** It uses the fetched salt and the Argon2 algorithm to hash the password entered by the user. This ensures that the password is never stored or compared in plain text.
   - **Comparison:** It compares the newly generated hash with the stored hash from the database.
   - **Success/Failure:**
      - If the hashes match, the authentication is successful, a success message is printed, and the function returns `0` (success). 
      - If the hashes don't match (incorrect password or account not found), an error message is displayed, and the function returns `1` (failure).
   - **Logging:**  It calls the `log_auth_event()` function to record the authentication attempt (success or failure) in the `auth_events` table.

**2. Authorization (Verifying Access Rights)**

   - **`authorize_user()` function:** This function handles authorization, determining if an authenticated user has permission to access a specific account. 
   - **Account ID Input:** It takes the account ID as input.
   - **Get Account Owner:** It queries the `accounts` table to retrieve the `name` (username) of the account owner associated with the provided `account_id`.
   - **Check against Authenticated User:** It compares the retrieved `owner` (account name) with the `username` of the currently authenticated user (which is set during the authentication process).
   - **Authorization Decision:**
      - If the `username` matches the `owner`, the user is authorized to access the account, and the function returns `0` (authorized).
      - If the `username` does not match the `owner`, the user is not authorized, and the function returns `1` (not authorized).


**How Authentication and Authorization Work Together**

1. **User Interaction:** The user is prompted to enter their username and password.
2. **Authentication:** The `authenticate_user()` function checks if the username/password combination is valid (correct credentials).
3. **Access Control (Authorization):** After successful authentication, many functions (like `deposit`, `withdraw`, `transfer`, `check_balance`, and `view_transaction_history`) call `authorize_user()`. This ensures that only the account owner can perform operations on that account.
4. **Restricted Access:** If a user tries to access an account they don't own, `authorize_user()` will return `1` (not authorized), and the respective function will prevent the operation from proceeding.


**Example:**

Imagine User "Alice" is authenticated. She tries to deposit funds into account ID 5. 

1. `deposit()` function calls `authorize_user(5)`.
2. `authorize_user(5)` retrieves the owner of account ID 5 from the database (let's say it's "Bob").
3. `authorize_user(5)` compares "Bob" (owner) with "Alice" (authenticated user).
4. Since "Alice" != "Bob", `authorize_user()` returns `1` (not authorized).
5. The `deposit()` function then displays an error message: "You are not authorized to make a deposit."


**In essence:** Authentication verifies who the user is, and authorization determines what they can do. This two-step process provides a basic layer of security for the banking system implemented in this Bash script.

I hope this detailed explanation clarifies how authentication and authorization are implemented within this banking system. Let me know if you have further questions! 



## Notes

* **Security:** The script uses Argon2 for secure password hashing. However, it's important to note that this is a simple demo and may not be suitable for production environments.
* **Data Persistence:** Account and transaction data is stored in the `bank.db` file. Backup this file regularly to prevent data loss.
* **Error Handling:** The script includes basic error handling, but it may not cover all potential scenarios.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please feel free to open an issue or submit a pull request.

