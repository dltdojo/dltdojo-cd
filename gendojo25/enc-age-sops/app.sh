#!/bin/bash
# This script demonstrates the usage of age and sops for encryption and decryption.
# It provides a menu-driven interface to perform various operations such as
# printing tool versions, creating age keys, and running an encryption/decryption demo.

set -euo pipefail

# Configuration
KEY_FILE="$HOME/.config/sops/age/keys.txt"
SOURCE_ENV="source.env"
ENCRYPTED_ENV="encrypted.env"
DECRYPTED_ENV="decrypted.env"

# Function to print the versions of age and sops tools
print_versions() {
    echo "Printing versions of age and sops:"
    age --version
    sops --version
}

# Function to demonstrate encryption and decryption using age and sops
enc_dec() {
    echo "=== Creating a demo .env file with a random password"
    RANDOM_PASSWORD=$(openssl rand -base64 12)
    cat << EOF > "$SOURCE_ENV"
USERNAME=the-user
PASSWORD=$RANDOM_PASSWORD
EOF
    cat "$SOURCE_ENV"

    echo "=== Using sops to encrypt '$SOURCE_ENV' with Age"
    sops -e -age "$AGE_PUB_KEY" "$SOURCE_ENV" | tee "$ENCRYPTED_ENV"

    echo "=== Using sops to decrypt and print result"
    sops -d "$ENCRYPTED_ENV" > "$DECRYPTED_ENV"
    cat "$DECRYPTED_ENV"
}

# Function to create an age key or prompt for overwrite if one already exists
create_age_key() {
    if [ -f "$KEY_FILE" ]; then
        echo "An age key already exists at $KEY_FILE"
        read -rp "Do you want to overwrite it? (y/N): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            echo "Key creation aborted."
            return
        fi
    fi

    echo "Creating age encryption key, and extracting the public key as AGE_PUB_KEY"
    mkdir -p "$(dirname "$KEY_FILE")"
    age-keygen > "$KEY_FILE"
    chmod 400 "$KEY_FILE"
    AGE_PUB_KEY=$(grep -oP '(?<=public key: ).*' "$KEY_FILE")
    echo "Age key created successfully. Public key: $AGE_PUB_KEY"
}

# Main menu function
main_menu() {
    local options=("Print versions" "Create age key" "Encrypt and Decrypt demo" "Exit")
    select opt in "${options[@]}"; do
        case $REPLY in
            1) print_versions ;;
            2) create_age_key ;;
            3) enc_dec ;;
            4) echo "Exiting..."; exit 0 ;;
            *) echo "Invalid option. Please try again." ;;
        esac
        break
    done
}

# Main loop
while true; do
    main_menu
    echo
done