# User Management System

This README provides an overview of the `users.sh` script, explains how salt is used in password hashing, and discusses why Argon2 is better than SHA256 for password hashing.

## users.sh Script Overview

The `users.sh` script is a Bash-based user management system that uses SQLite for data storage and Argon2 for password hashing. Here are the main features of the script:

1. **User Management:**
   - Add new users
   - Authenticate users
   - Update user passwords

2. **Security Features:**
   - Password hashing using Argon2id
   - Salt generation for each password
   - Secure storage of user credentials

3. **Logging:**
   - Tracks authentication events (successful and failed attempts)

4. **Database:**
   - Uses SQLite to store user information and authentication events
   - Two tables: `users` and `auth_events`

5. **Menu-driven Interface:**
   - Easy-to-use command-line interface for managing users

## Salt Usage in Password Hashing

In the `users.sh` script, salt is used to enhance the security of password hashing. Here's how it works:

1. **Salt Generation:** 
   When a new user is added or a password is updated, a unique salt is generated for each password using the `generate_salt()` function:

   ```bash
   generate_salt() {
     head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16
     echo
   }
   ```

   This function creates a random 16-character string using alphanumeric characters.

2. **Salt Application:**
   The salt is combined with the user's password before hashing:

   ```bash
   hash=$(echo -n "$password" | argon2 "$salt" -id -l 32 -r)
   ```

3. **Storage:**
   Both the salt and the resulting hash are stored in the database for each user:

   ```bash
   sqlite3 "$DB_FILE" "INSERT INTO users (username, salt, hash) VALUES ('$username', '$salt', '$hash');"
   ```

4. **Authentication:**
   During authentication, the stored salt is retrieved and combined with the entered password to generate a hash, which is then compared with the stored hash.

The use of salt in password hashing provides several benefits:
- Prevents rainbow table attacks
- Makes brute-force attacks more difficult and time-consuming
- Ensures that identical passwords for different users have different hashes

## Why Argon2 is Better than SHA256 for Password Hashing

The `users.sh` script uses Argon2 (specifically Argon2id) for password hashing instead of algorithms like SHA256. Here's why Argon2 is a better choice:

1. **Purpose-built for Password Hashing:**
   Argon2 was designed specifically for password hashing, unlike SHA256, which is a general-purpose cryptographic hash function.

2. **Memory-Hard Function:**
   Argon2 is memory-hard, meaning it requires a significant amount of memory to compute. This makes it resistant to GPU-based and ASIC-based attacks, which are effective against SHA256.

3. **Adjustable Parameters:**
   Argon2 allows adjustment of time cost, memory cost, and parallelism, making it adaptable to different security requirements and hardware capabilities.

4. **Resistance to Side-Channel Attacks:**
   Argon2id variant (used in this script) provides better resistance to side-channel attacks compared to SHA256.

5. **Modern Design:**
   Argon2 incorporates the latest advancements in cryptography and was selected as the winner of the Password Hashing Competition in 2015.

6. **Slow Hashing:**
   Argon2 is deliberately slow, which is a desirable property for password hashing as it significantly slows down brute-force attacks.

7. **Built-in Salt:**
   While SHA256 requires manual salt implementation, Argon2 has built-in salt support, reducing the risk of implementation errors.

In conclusion, the `users.sh` script demonstrates good security practices by using Argon2 for password hashing and incorporating unique salts for each password. This approach provides strong protection against various types of attacks and is significantly more secure than using older hash functions like SHA256 for password storage.

## argon2 help

```sh
argon2 -h
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

```

## Using Docker Compose

This project includes two Docker Compose configurations to run the user management system in a containerized environment: `compose.yaml` and `compose-sleep.yaml`. Each file serves a different purpose and usage scenario.

### compose.yaml

The `compose.yaml` file is designed for direct execution of the `users.sh` script within the container.

Usage:
1. Run the container and execute the script:
   ```sh
   docker compose run --rm app101
   ```

This command will build the Docker image (if not already built), start the container, and immediately run the `users.sh` script. Once the script execution is complete, the container will stop.

### compose-sleep.yaml

The `compose-sleep.yaml` file is designed for scenarios where you want to keep the container running and execute the script manually or perform other operations within the container.

Usage:
1. Start the container:
   ```
   docker compose -f compose-sleep.yaml up -d
   ```

2. Access the container's shell:
   ```
   docker compose -f compose-sleep.yaml exec app101 bash
   ```

3. Run the users.sh script manually:
   ```
   bash /app/users.sh
   ```

4. When finished, stop the container:
   ```
   docker compose -f compose-sleep.yaml down
   ```

The `compose-sleep.yaml` configuration keeps the container running by using a `sleep` command, allowing you to access the container multiple times without restarting it.

### Key Differences

1. **Execution Method:**
   - `compose.yaml`: Runs the `users.sh` script automatically when the container starts.
   - `compose-sleep.yaml`: Keeps the container running, allowing manual execution of the script and other commands.

2. **Container Lifecycle:**
   - `compose.yaml`: The container stops after the script execution is complete.
   - `compose-sleep.yaml`: The container continues running until explicitly stopped.

3. **Use Case:**
   - `compose.yaml`: Ideal for quick, one-time executions of the script.
   - `compose-sleep.yaml`: Better for development, debugging, or scenarios where you need persistent access to the container.

### Notes

- Both configurations mount the `users.sh` script as read-only inside the container for security purposes.
- Any data created by the script (like the SQLite database) is stored inside the container and will be lost when the container is removed. For persistent storage, consider adding a volume configuration.

**Security Considerations:**
- Ensure that you manage access to the Docker host system securely, as anyone with access to Docker can potentially access the container and the script within it.
- Consider implementing additional security measures like Docker secrets for managing sensitive information if needed in a production environment.

By using these Docker Compose configurations, you can easily set up and run the user management system in an isolated environment, which is particularly useful for testing or deploying in different environments without worrying about system dependencies.