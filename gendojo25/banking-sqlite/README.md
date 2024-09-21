# Banking101 - Simple Banking System

This project implements a basic banking system using Bash scripting and SQLite. It provides a command-line interface for managing bank accounts, performing transactions, and viewing account information.

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

   This command will build the Docker image (if not already built) and run the banking application.

## Features

The banking system provides the following features:

1. Create Account: Set up a new bank account with a unique ID.
2. Deposit: Add funds to an existing account.
3. Withdraw: Remove funds from an existing account.
4. Check Balance: View the current balance of an account.
5. Transfer: Move funds from one account to another.
6. Print Tables (Debug): Display all accounts and transactions (for debugging purposes).
7. View Transaction History: See the transaction history for a specific account or all accounts.

## Usage

Once you run the application, you'll be presented with a menu of options. Enter the number corresponding to the action you want to perform and follow the prompts.

Example:

```
Banking System Menu:

1. Create Account
2. Deposit
3. Withdraw
4. Check Balance
5. Transfer
6. Print Tables (Debug)
7. View Transaction History
8. Exit

Enter your choice:
```

## Database

The application uses an SQLite database (`bank.db`) to store account information and transactions. The database is automatically created if it doesn't exist when you first run the application.

## Notes

- The application runs in a Docker container, ensuring consistency across different environments.
- The `banking.sh` script is mounted as a volume in the Docker container, allowing for easy updates without rebuilding the image.
- All data is stored in the SQLite database within the container. If you need data persistence between runs, you may want to consider mounting a volume for the database file.

## Security Considerations

This is a simple demonstration project and lacks many security features that would be necessary for a real-world banking application. In a production environment, you would need to implement proper authentication, encryption, input validation, and other security measures.

## Contributing

Feel free to fork this repository and submit pull requests for any improvements or additional features you'd like to add.

## License

This project is open-source and available under the MIT License.