# The Masterclass: Trust, Cryptography, and SSL on the Web

> **Document Type:** Conversational Deep-Dive & Mental Model Guide  
> **Topic:** How HTTPS, Public/Private Keys, Certbot, and Nginx actually work together  
> **Context:** Movie Booking System Production VPS (`https://rhrony05.me`)  

---

## 💡 The Core Mental Model (How Everything Connects)

Here is the exact mental model of how a secure connection works between a user's browser and our server:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. THE KEYS:                                                                │
│    Our server generates two keys: a Public Key and a Private Key.          │
│    Anyone can lock data with the Public Key, but ONLY our server's Private   │
│    Key can unlock it.                                                       │
│                                                                             │
│ 2. THE PROOF (Let's Encrypt & Certbot):                                     │
│    To prove this Public Key actually belongs to our server (and not an      │
│    imposter), we get it signed by Let's Encrypt. Certbot is the tool that   │
│    talks to Let's Encrypt, proves we control rhrony05.me, and gets our keys │
│    signed. Once signed, Chrome trusts our Public Key with a green padlock.  │
│                                                                             │
│ 3. THE HANDSHAKE (The Session Key):                                         │
│    When a user visits our site, their browser generates a temporary,        │
│    random SESSION KEY. The browser encrypts this Session Key using our      │
│    Server's Public Key and sends it across the internet.                    │
│                                                                             │
│ 4. THE SHARED SECRET:                                                       │
│    Our server decrypts the message using its Private Key.                   │
│    Now, BOTH the browser and the server hold the exact same SESSION KEY.     │
│                                                                             │
│ 5. FAST TWO-WAY ENCRYPTION:                                                 │
│    From that millisecond on, all data flowing back and forth (user OTPs,    │
│    movie lists, seat selections) is encrypted and decrypted using that      │
│    shared Session Key!                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ The 3 Foundational Problems of the Internet

To understand why we ran Certbot, why we edited Nginx, and why Let's Encrypt exists, we must understand the three problems that every website on Earth must solve:

```text
The 3 Problems of the Public Internet:
1. Eavesdropping Problem  ──▶ Solved by Cryptography (Public/Private Keys & Session Keys)
2. Impersonation Problem  ──▶ Solved by Certificate Authorities (Let's Encrypt Passport)
3. Domain Proof Problem   ──▶ Solved by the ACME Protocol (Certbot Challenge)
```

---

### Problem 1: The Eavesdropping Problem (Why Plain HTTP is Dangerous)

When a user visits `http://rhrony05.me` on a public university or café Wi-Fi:
* The user's request hops across 10 to 15 intermediate routers, switches, and ISPs before reaching Azure.
* Under plain **HTTP (Port 80)**, every packet is readable plaintext:
  `POST /api/bookings/verify HTTP/1.1 {"otp": "123456"}`
* Anyone on that network running Wireshark can read passwords, Google login tokens, and OTPs.

**The Fix:** Encryption scrambles the data into unreadable bytes before it leaves the laptop. Even if intercepted, attackers only see meaningless garbled text.

---

### Problem 2: The Impersonation Problem (Why We Need "Certificate Authorities")

Anyone in the world can generate a Public and Private key pair on their laptop.
* What if an attacker intercepts your connection to `rhrony05.me` and sends you *their* Public Key?
* Your browser would encrypt your password with the attacker's key!

**How does Google Chrome know a Public Key genuinely belongs to Rony's server and not an attacker?**

#### The Solution: The "Passport Office" of the Internet
* Certificate Authorities (CAs) like **Let's Encrypt** act as global Passport Offices.
* Operating systems (Windows, macOS, iOS, Android) come with a pre-installed list of trusted Certificate Authorities.
* When our server hands its certificate to Chrome, Chrome checks: *"Did Let's Encrypt digitally sign this key?"*
* If **YES** ➔ Trusted Padlock (HTTPS).
* If **NO** ➔ Scary Red Warning: *"Your connection is not private"*.

---

### Problem 3: The Proof Problem (How Let's Encrypt Verifies Ownership)

Before Let's Encrypt signs our key, they must verify: **Does this person actually control `rhrony05.me`?**

They use an automated verification protocol called **ACME (The HTTP-01 Challenge)**:

```text
[ Our Azure Server (Certbot) ]                     [ Let's Encrypt Server ]
             │                                                 │
             │ 1. "Please sign an SSL certificate for          │
             │     rhrony05.me"                                │
             ├────────────────────────────────────────────────▶│
             │                                                 │
             │ 2. "Prove you own it! Create a secret token at: │
             │     http://rhrony05.me/.well-known/acme-challenge/test"
             │◀────────────────────────────────────────────────┤
             │                                                 │
             │ 3. Certbot writes that secret file to disk.     │
             │    "Done! Go read it."                          │
             ├────────────────────────────────────────────────▶│
             │                                                 │
             │ 4. Let's Encrypt visits that URL over Port 80.  │
             │    Nginx serves the file.                       │
             │    Let's Encrypt confirms the token matches!    │
             │                                                 │
             │ 5. "Proof verified! Here are your signed        │
             │     fullchain.pem and privkey.pem files."       │
             │◀────────────────────────────────────────────────┤
```

---

## ⚡ The Breakthrough: Resolving the Cryptographic Paradox

### The Question:
> *"If the server encrypts data back to the browser, how does the browser decrypt it? Anyone can have the public key, so how does two-way encryption work safely?"*

### The Answer: Hybrid Encryption
TLS uses **two different types of encryption** working together:

1. **Asymmetric (Public/Private Keys):** Used for **only 2 milliseconds** during the initial handshake just to safely deliver a secret temporary password.
2. **Symmetric (The Session Key):** Used for **100% of all real data** flowing back and forth!

```text
[ Browser (Chrome) ]                                    [ Azure Server (Nginx) ]
         │                                                         │
         │ 1. "Hello, let's talk securely."                        │
         ├────────────────────────────────────────────────────────▶│
         │                                                         │
         │ 2. Server sends signed Certificate (fullchain.pem)      │
         │◀────────────────────────────────────────────────────────┤
         │                                                         │
         │ 3. Chrome validates certificate against trusted roots.  │
         │    Chrome generates a random 256-bit SESSION KEY.       │
         │                                                         │
         │ 4. Chrome locks the SESSION KEY with Server's PUBLIC KEY│
         │    and sends the locked package to server.              │
         ├────────────────────────────────────────────────────────▶│
         │                                                         │
         │ 5. Server unlocks the package using its PRIVATE KEY     │
         │    (privkey.pem).                                       │
         │                                                         │
         │ ======================================================= │
         │   HANDSHAKE COMPLETE! Both sides share the SESSION KEY! │
         │ ======================================================= │
         │                                                         │
         │ 6. Browser sends Request (Encrypted with Session Key)   │
         ├────────────────────────────────────────────────────────▶│
         │                                                         │ (Nginx decrypts)
         │ 7. Server sends Movie JSON (Encrypted with Session Key) │
         │◀────────────────────────────────────────────────────────┤
         │ (Chrome decrypts)                                       │
```

---

## ❓ The Core Q&A: Clearing Every Confusion

### Q1: Are we calling the public/private key the SSL/TLS certificates? (And is TLS just upgraded SSL?)
* **SSL vs TLS:** Yes! In 1995 Netscape created SSL. In 1999 the internet standards body renamed and upgraded it to **TLS (Transport Layer Security)**. Today everyone uses TLS 1.2 and TLS 1.3, but people still say "SSL" out of habit.
* **Key vs Certificate:**
  * **The Public Key:** Just the raw mathematical numbers.
  * **The Certificate (`fullchain.pem`):** It is your **Public Key + Your Domain Name (`rhrony05.me`) + Let's Encrypt's Official Digital Signature**. Think of the Public Key like your face, and the Certificate like your official Passport.

---

### Q2: Do we get SSL from Namecheap where we bought the domain?
* Namecheap sells domains, and they try to upsell SSL certificates for $10–$50 per year.
* But in 2016, the tech industry created **Let's Encrypt**—a non-profit that gives away trusted SSL certificates **100% free forever**.
* You don't buy SSL from Namecheap. You just use **Certbot** on your Linux VPS to get it from Let's Encrypt for free!

---

### Q3: How does Certbot automatically renew if we didn’t write a cron job?
* When you install `certbot` on Ubuntu, it automatically installs a **Systemd background timer** into Linux (`certbot.timer`).
* You can see it by running: `systemctl list-timers | grep certbot`
* It wakes up **twice every single day** and checks your certificates on disk:
  * If more than 30 days remain: Goes back to sleep.
  * If less than 30 days remain: Automatically contacts Let's Encrypt, renews the keys, and reloads Nginx.

---

### Q4: When 100 users visit at once, where does the server store 100 session keys?
* **In RAM memory!**
* In `nginx.conf`, we wrote:
  ```nginx
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 1d;
  ```
* This tells Nginx to reserve **10 Megabytes of RAM** as a key-value dictionary (`User_ID ➔ Session_Key`).
* Because each Session Key is tiny (just 32 bytes for AES-256), **10MB of RAM can hold roughly 40,000 simultaneous active user sessions**!
* It remembers each user for 1 day so if a user clicks around the site, the server skips the slow 2ms handshake and reuses the existing session key.

---

### Q5: Why are there two different folders? (`/var/www/certbot` vs `/etc/letsencrypt/`)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. /var/www/certbot  ➔  THE TEMPORARY BULLETIN BOARD                       │
│    - Purpose: An ephemeral public folder used ONLY during ACME verification.│
│    - Content: Temporary random text tokens (e.g. "test-token-123").         │
│    - Secret keys NEVER live here!                                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Once Let's Encrypt reads the token)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. /etc/letsencrypt/live/rhrony05.me/  ➔  THE BANK VAULT                     │
│    - Purpose: Secure, persistent storage for cryptographic certificates.    │
│    - Content:                                                               │
│        • fullchain.pem  ➔ The Public Certificate (handed to browsers).      │
│        • privkey.pem    ➔ The Secret Private Key (kept safe on server).     │
│    - Mounted read-only (:ro) into the Nginx Docker container.               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Q6: Why should `setup-server.sh` install Certbot, and what is `deploy.sh` for?

* **`setup-server.sh` (The One-Time Provisioner):**
  Installs base system tools: Docker, UFW firewall, Swap memory, and **Certbot**. Run ONCE per machine.
* **`deploy.sh` (The Day-1 Application Bootstrap):**
  Pulls the repo, checks if `/etc/letsencrypt/live/rhrony05.me` exists. If not, it uses Certbot to grab the first certificates from Let's Encrypt, creates `/var/www/certbot`, and starts the Docker containers.
* **GitHub Actions CI/CD (`ci.yml`):**
  The automated robot that runs on every `git push origin main`, SSHs into the server, and updates the application with zero downtime.

---

## 📋 The Complete Request Lifecycle (Down to the Millisecond)

```text
1. DNS Resolution:
   User types "rhrony05.me" ➔ DNS Resolver returns IP 104.208.80.230.

2. Insecure Port 80 Intercept:
   Browser connects on Port 80 (HTTP).
   Nginx intercepts: "return 301 https://$host$request_uri".
   Browser immediately switches to Port 443 (HTTPS).

3. The TLS Handshake (Port 443):
   Browser and Nginx exchange public certificate (fullchain.pem).
   Chrome verifies signature against Windows/Mac root trust store.
   Browser encrypts random 256-bit SESSION KEY with server's public key.
   Nginx decrypts with privkey.pem.

4. Encrypted Data Transfer:
   Browser sends encrypted request: "GET /api/movies".
   Nginx decrypts request using the shared SESSION KEY.
   Nginx forwards plaintext internally to "http://backend:5000".
   Express API queries PostgreSQL and returns movie JSON.
   Nginx encrypts response using SESSION KEY and sends to browser.
   Browser decrypts and displays movie posters!
```
