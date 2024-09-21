# Age and SOPS Encryption Demo

This project demonstrates the usage of Age and SOPS for encryption and decryption of sensitive data. It provides a Docker-based environment with a simple bash script to showcase various operations such as creating Age keys, encrypting files, and decrypting files.

## Project Structure

- `app.sh`: Main script that provides a menu-driven interface for various operations.
- `compose.yaml`: Docker Compose file for setting up the project environment.
- `Dockerfile`: Defines the Docker image for the project.

## Setup and Usage

1. Ensure you have Docker and Docker Compose installed on your system.

2. Clone this repository:

```sh
git clone <repository-url>
cd <repository-directory>
```

3. Run the application using Docker Compose:

```sh
docker compose run --rm app101
```

4. Follow the on-screen menu to:
- Print versions of Age and SOPS
- Create an Age key
- Run an encryption and decryption demo

## Features

- **Version Check**: Print the installed versions of Age and SOPS tools.
- **Age Key Creation**: Generate a new Age key pair, with an option to overwrite an existing key.
- **Encryption/Decryption Demo**: Create a sample .env file with a random password, encrypt it using Age and SOPS, and then decrypt it to demonstrate the process.

## Why Encrypted Data at Rest Keeps Data Loss Risk Low

Encrypting data at rest is a crucial security practice that significantly reduces the risk of data loss. Here's why:

1. **Protection Against Unauthorized Access**: Even if an unauthorized party gains access to the physical storage or files, the encrypted data remains unreadable without the decryption key.

2. **Mitigation of Insider Threats**: Encryption helps protect against potential insider threats by ensuring that even those with access to the storage systems cannot read the data without proper authorization.

3. **Compliance with Data Protection Regulations**: Many data protection regulations require encryption of sensitive data at rest, helping organizations avoid penalties and reputational damage.

4. **Protection in Case of Device Loss or Theft**: If a device containing sensitive data is lost or stolen, encrypted data remains secure and unreadable to the finder or thief.

5. **Data Integrity**: Encryption often includes integrity checks, ensuring that the data has not been tampered with or corrupted.

6. **Secure Data Disposal**: When it's time to dispose of old storage media, encrypted data is much harder to recover, reducing the risk of data leakage during the disposal process.

7. **Separation of Duties**: Encryption allows for a separation between those who can access the storage systems and those who can access the actual data, adding an extra layer of security.

In this project, we demonstrate the use of Age and SOPS for encrypting sensitive information (like passwords in .env files). By using these tools, we ensure that even if the encrypted files are compromised, the actual sensitive data remains protected, thus keeping the risk of data loss low.

## Note

This project is for demonstration purposes only. In a production environment, additional security measures and best practices should be implemented.

## Tool Help

For detailed information on how to use Age and SOPS, you can refer to their respective help outputs below:


### SOPS Help

```sh
sops --help
NAME:
   sops - sops - encrypted file editor with AWS KMS, GCP KMS, Azure Key Vault, age, and GPG support

USAGE:
   sops is an editor of encrypted files that supports AWS KMS, GCP, AZKV,
  PGP, and Age

   To encrypt or decrypt a document with AWS KMS, specify the KMS ARN
   in the -k flag or in the SOPS_KMS_ARN environment variable.
   (you need valid credentials in ~/.aws/credentials or in your env)

   To encrypt or decrypt a document with GCP KMS, specify the
   GCP KMS resource ID in the --gcp-kms flag or in the SOPS_GCP_KMS_IDS
   environment variable.
   (You need to setup Google application default credentials. See
    https://developers.google.com/identity/protocols/application-default-credentials)


   To encrypt or decrypt a document with HashiCorp Vault's Transit Secret
   Engine, specify the Vault key URI name in the --hc-vault-transit flag
   or in the SOPS_VAULT_URIS environment variable (for example
   https://vault.example.org:8200/v1/transit/keys/dev, where
   'https://vault.example.org:8200' is the vault server, 'transit' the
   enginePath, and 'dev' is the name of the key).
   (You need to enable the Transit Secrets Engine in Vault. See
    https://www.vaultproject.io/docs/secrets/transit/index.html)

   To encrypt or decrypt a document with Azure Key Vault, specify the
   Azure Key Vault key URL in the --azure-kv flag or in the
   SOPS_AZURE_KEYVAULT_URL environment variable.
   (Authentication is based on environment variables, see
    https://docs.microsoft.com/en-us/go/azure/azure-sdk-go-authorization#use-environment-based-authentication.
    The user/sp needs the key/encrypt and key/decrypt permissions.)

   To encrypt or decrypt using age, specify the recipient in the -a flag,
   or in the SOPS_AGE_RECIPIENTS environment variable.

   To encrypt or decrypt using PGP, specify the PGP fingerprint in the
   -p flag or in the SOPS_PGP_FP environment variable.

   To use multiple KMS or PGP keys, separate them by commas. For example:
       $ sops -p "10F2...0A, 85D...B3F21" file.yaml

   The -p, -k, --gcp-kms, --hc-vault-transit, and --azure-kv flags are only
   used to encrypt new documents. Editing or decrypting existing documents
   can be done with "sops file" or "sops decrypt file" respectively. The KMS and
   PGP keys listed in the encrypted documents are used then. To manage master
   keys in existing documents, use the "add-{kms,pgp,gcp-kms,azure-kv,hc-vault-transit}"
   and "rm-{kms,pgp,gcp-kms,azure-kv,hc-vault-transit}" flags with --rotate
   or the updatekeys command.

   To use a different GPG binary than the one in your PATH, set SOPS_GPG_EXEC.

   To select a different editor than the default (vim), set EDITOR.

   Note that flags must always be provided before the filename to operate on.
   Otherwise, they will be ignored.

   For more information, see the README at https://github.com/getsops/sops

VERSION:
   3.9.0

AUTHORS:
   AJ Bahnken <ajvb@mozilla.com>
   Adrian Utrilla <adrianutrilla@gmail.com>
   Julien Vehent <jvehent@mozilla.com>

COMMANDS:
   exec-env    execute a command with decrypted values inserted into the environment
   exec-file   execute a command with the decrypted contents as a temporary file
   publish     Publish sops file or directory to a configured destination
   keyservice  start a SOPS key service server
   filestatus  check the status of the file, returning encryption status
   groups      modify the groups on a SOPS file
   updatekeys  update the keys of SOPS files using the config file
   decrypt     decrypt a file, and output the results to stdout
   encrypt     encrypt a file, and output the results to stdout
   rotate      generate a new data encryption key and reencrypt all values with the new key
   edit        edit an encrypted file
   set         set a specific key or branch in the input document. value must be a json encoded string. eg. '/path/to/file ["somekey"][0] {"somevalue":true}'
   unset       unset a specific key or branch in the input document.
   help, h     Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --decrypt, -d                            decrypt a file and output the result to stdout
   --encrypt, -e                            encrypt a file and output the result to stdout
   --rotate, -r                             generate a new data encryption key and reencrypt all values with the new key
   --disable-version-check                  do not check whether the current version is latest during --version
   --kms value, -k value                    comma separated list of KMS ARNs [$SOPS_KMS_ARN]
   --aws-profile value                      The AWS profile to use for requests to AWS
   --gcp-kms value                          comma separated list of GCP KMS resource IDs [$SOPS_GCP_KMS_IDS]
   --azure-kv value                         comma separated list of Azure Key Vault URLs [$SOPS_AZURE_KEYVAULT_URLS]
   --hc-vault-transit value                 comma separated list of vault's key URI (e.g. 'https://vault.example.org:8200/v1/transit/keys/dev') [$SOPS_VAULT_URIS]
   --pgp value, -p value                    comma separated list of PGP fingerprints [$SOPS_PGP_FP]
   --age value, -a value                    comma separated list of age recipients [$SOPS_AGE_RECIPIENTS]
   --in-place, -i                           write output back to the same file instead of stdout
   --extract value                          extract a specific key or branch from the input document. Decrypt mode only. Example: --extract '["somekey"][0]'
   --input-type value                       currently json, yaml, dotenv and binary are supported. If not set, sops will use the file's extension to determine the type
   --output-type value                      currently json, yaml, dotenv and binary are supported. If not set, sops will use the input file's extension to determine the output format
   --show-master-keys, -s                   display master encryption keys in the file during editing
   --add-gcp-kms value                      add the provided comma-separated list of GCP KMS key resource IDs to the list of master keys on the given file
   --rm-gcp-kms value                       remove the provided comma-separated list of GCP KMS key resource IDs from the list of master keys on the given file
   --add-azure-kv value                     add the provided comma-separated list of Azure Key Vault key URLs to the list of master keys on the given file
   --rm-azure-kv value                      remove the provided comma-separated list of Azure Key Vault key URLs from the list of master keys on the given file
   --add-kms value                          add the provided comma-separated list of KMS ARNs to the list of master keys on the given file
   --rm-kms value                           remove the provided comma-separated list of KMS ARNs from the list of master keys on the given file
   --add-hc-vault-transit value             add the provided comma-separated list of Vault's URI key to the list of master keys on the given file ( eg. https://vault.example.org:8200/v1/transit/keys/dev)
   --rm-hc-vault-transit value              remove the provided comma-separated list of Vault's URI key from the list of master keys on the given file ( eg. https://vault.example.org:8200/v1/transit/keys/dev)
   --add-age value                          add the provided comma-separated list of age recipients fingerprints to the list of master keys on the given file
   --rm-age value                           remove the provided comma-separated list of age recipients from the list of master keys on the given file
   --add-pgp value                          add the provided comma-separated list of PGP fingerprints to the list of master keys on the given file
   --rm-pgp value                           remove the provided comma-separated list of PGP fingerprints from the list of master keys on the given file
   --ignore-mac                             ignore Message Authentication Code during decryption
   --mac-only-encrypted                     compute MAC only over values which end up encrypted
   --unencrypted-suffix value               override the unencrypted key suffix.
   --encrypted-suffix value                 override the encrypted key suffix. When empty, all keys will be encrypted, unless otherwise marked with unencrypted-suffix.
   --unencrypted-regex value                set the unencrypted key regex. When specified, only keys matching the regex will be left unencrypted.
   --encrypted-regex value                  set the encrypted key regex. When specified, only keys matching the regex will be encrypted.
   --unencrypted-comment-regex value        set the unencrypted comment suffix. When specified, only keys that have comment matching the regex will be left unencrypted.
   --encrypted-comment-regex value          set the encrypted comment suffix. When specified, only keys that have comment matching the regex will be encrypted.
   --config value                           path to sops' config file. If set, sops will not search for the config file recursively.
   --encryption-context value               comma separated list of KMS encryption context key:value pairs
   --set value                              set a specific key or branch in the input document. value must be a json encoded string. (edit mode only). eg. --set '["somekey"][0] {"somevalue":true}'
   --shamir-secret-sharing-threshold value  the number of master keys required to retrieve the data key with shamir (default: 0)
   --indent value                           the number of spaces to indent YAML or JSON encoded file (default: 0)
   --verbose                                Enable verbose logging output
   --output value                           Save the output after encryption or decryption to the file specified
   --filename-override value                Use this filename instead of the provided argument for loading configuration, and for determining input type and output type
   --decryption-order value                 comma separated list of decryption key types [$SOPS_DECRYPTION_ORDER]
   --enable-local-keyservice                use local key service
   --keyservice value                       Specify the key services to use in addition to the local one. Can be specified more than once. Syntax: protocol://address. Example: tcp://myserver.com:5000
   --help, -h                               show help
   --version, -v                            print the version

```

### Age Help

```sh
age --help
Usage:
    age [--encrypt] (-r RECIPIENT | -R PATH)... [--armor] [-o OUTPUT] [INPUT]
    age [--encrypt] --passphrase [--armor] [-o OUTPUT] [INPUT]
    age --decrypt [-i PATH]... [-o OUTPUT] [INPUT]

Options:
    -e, --encrypt               Encrypt the input to the output. Default if omitted.
    -d, --decrypt               Decrypt the input to the output.
    -o, --output OUTPUT         Write the result to the file at path OUTPUT.
    -a, --armor                 Encrypt to a PEM encoded format.
    -p, --passphrase            Encrypt with a passphrase.
    -r, --recipient RECIPIENT   Encrypt to the specified RECIPIENT. Can be repeated.
    -R, --recipients-file PATH  Encrypt to recipients listed at PATH. Can be repeated.
    -i, --identity PATH         Use the identity file at PATH. Can be repeated.

INPUT defaults to standard input, and OUTPUT defaults to standard output.
If OUTPUT exists, it will be overwritten.

RECIPIENT can be an age public key generated by age-keygen ("age1...")
or an SSH public key ("ssh-ed25519 AAAA...", "ssh-rsa AAAA...").

Recipient files contain one or more recipients, one per line. Empty lines
and lines starting with "#" are ignored as comments. "-" may be used to
read recipients from standard input.

Identity files contain one or more secret keys ("AGE-SECRET-KEY-1..."),
one per line, or an SSH key. Empty lines and lines starting with "#" are
ignored as comments. Passphrase encrypted age files can be used as
identity files. Multiple key files can be provided, and any unused ones
will be ignored. "-" may be used to read identities from standard input.

When --encrypt is specified explicitly, -i can also be used to encrypt to an
identity file symmetrically, instead or in addition to normal recipients.

Example:
    $ age-keygen -o key.txt
    Public key: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
    $ tar cvz ~/data | age -r age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p > data.tar.gz.age
    $ age --decrypt -i key.txt -o data.tar.gz data.tar.gz.age

```