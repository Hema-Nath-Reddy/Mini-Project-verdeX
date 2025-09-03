Verdex – Carbon Credit Trading System 🌱
Overview

Verdex is a carbon credit trading platform built as a mini project.
It allows users to buy, sell, and manage carbon credits in a transparent way.
The system includes both a user portal and an admin dashboard to handle transactions and manage accounts.

Features 🚀

User Authentication – Sign up, log in, and manage your profile.

Buy & Sell Credits – Trade carbon credits in a secure environment.

Transaction History – Track all your past trades.

Wallet/Balance System – Add and manage funds to purchase credits.

Notifications/Alerts – Stay updated on market activity.

Admin Portal – Manage users, credits, and approve/reject requests.

Secure Roles – Role-based access (user and admin).

Tech Stack 🛠

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: PostgreSQL

Project Structure 📂
verdex/
├── client/   # React.js code
├── server/    # Node.js + Express.js APIs

Getting Started ⚡
Prerequisites

Node.js & npm installed

Database set up (ostgreSQL

Installation

Clone the repo

git clone https://github.com/Hema-Nath-Reddy/Mini-Project-verdeX.git
cd verdex


Install dependencies for both frontend and backend

cd client && npm install
cd server && npm install


Set up environment variables (.env file in backend)

SUPABASE_URL=your_database_url
SUPABASE_ANON_KEY=your_secret_key


Start backend server

cd server
npm run dev


Start frontend

cd client
npm run dev

Future Improvements 🔮

Add real-time market prices for credits

Implement blockchain for transparent credit verification

Deploy to cloud (Vercel/Netlify + Render/Heroku)

License 📜

This project is created for educational purposes as a mini project.
