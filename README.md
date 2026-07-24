# Fidelius

Manage your Bitwarden items and drag-and-drop to organize everything into neat folders!

![Demo](./assets/fidelius_demo.gif)

## Installation

Fidelius is entirely locally hosted.

**Prerequisites:**

- Bitwarden account
- [Bitwarden CLI](https://bitwarden.com/help/cli/)

**Setup:**

1. Clone this repository

    ```bash
    git clone https://github.com/woojiahao/fidelius.git
    cd fidelius/
    ```

2. Start the Bitwarden server

    ```bash
    bw serve --disable-origin-protection
    ```

3. Start the proxy server

    ```bash
    yarn dev:proxy
    ```

4. Start the web application

    ```bash
    yarn dev:web
    ```

5. Access the web application on <http://localhost:5173>
6. Enter the Bitwarden server's url, which defaults to <http://localhost:8087>
7. Enter your Bitwarden master password if prompted