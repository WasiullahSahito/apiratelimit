# MERN API Rate Limiting & Throttling

This project provides a robust back-end solution using Node.js and Express to protect APIs from abuse, brute-force attacks, and server overload. It implements comprehensive rate limiting and request throttling strategies, designed to be modular, configurable, and scalable.

## ✨ Key Features

-   **Global Rate Limiting**: A general limit (e.g., 100 requests/15 min) is applied to all API endpoints to prevent server overload.
-   **Endpoint-Specific Limiting**: Stricter limits (e.g., 10 requests/10 min) are enforced on sensitive endpoints like `/login` and `/signup`.
-   **Brute-Force Protection**: Repeated failed login attempts from the same IP trigger an incremental delay, slowing down attackers and making brute-force attacks impractical.
-   **Environment-Driven Configuration**: All parameters (limits, time windows, delays) are easily configurable via a `.env` file.
-   **Violation Logging**: Rate limit violations are logged to the console with key details (IP, path, method) for easy monitoring and analysis.
-   **IP Whitelisting**: Trusted IP addresses can be configured to bypass all rate limits, ideal for admin services or internal APIs.
-   **Scalable (Bonus)**: Includes an optional Redis-based store. When Redis is configured, rate limits are shared across all instances of the application, making it suitable for horizontally scaled and distributed environments.

## 🛠️ Tech Stack

-   **Node.js** & **Express.js**: For the core server and routing.
-   **MongoDB** & **Mongoose**: For the database layer.
-   **`express-rate-limit`**: Middleware for applying request limits.
-   **`express-slow-down`**: Middleware for request throttling (slowing down responses).
-   **`rate-limit-redis`**: A Redis store for `express-rate-limit` for distributed scaling.
-   **`dotenv`**: For managing environment variables.
-   **Redis**: (Optional) For a distributed, scalable rate-limiting store.

## 🚀 Setup & Run Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/WasiullahSahito/apiratelimit.git
    cd mern-api-rate-limiting
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Copy the example file to create your own configuration.
    ```bash
    cp .env.example .env
    ```
    Now, open `.env` and fill in your `MONGO_URI` and other desired settings.

4.  **(Optional) Run Redis for Distributed Limiting:**
    If you want to test the scalable rate limiting, you need a running Redis instance. The easiest way is with Docker:
    ```bash
    docker run --name my-redis -p 6379:6379 -d redis
    ```
    Ensure your `REDIS_URL` in the `.env` file matches (`redis://127.0.0.1:6379`). If `REDIS_URL` is not set, the app will gracefully fall back to an in-memory store.

5.  **Start the server:**
    For development with auto-reloading:
    ```bash
    npm run dev
    ```
    For production:
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:5000`.

## 🧪 Example Requests & Responses

Use a tool like `curl` or Postman to test the endpoints. The server must be running.

### 1. General Endpoint (`/api/data/public`)

This endpoint is covered by the global rate limiter (default: 100 requests / 15 minutes).

**Successful Request:**
```bash
curl -i http://localhost:5000/api/data/public
