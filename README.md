# Project Setup & Run Instructions

This project includes a Node.js API, a Lambda-style worker, and a Vite + React frontend.

## Setup Instructions

1. **Start Docker services**

```bash
docker-compose up -d
```

2. **Start frontend**

```bash
cd frontend
npm install
npm run dev
```

3. **Access the application**

* API: [http://localhost:3000](http://localhost:3000)
* Frontend: [http://localhost:5173](http://localhost:5173)
