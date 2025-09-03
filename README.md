<h1>🌱 Verdex – Carbon Credit Trading System</h1>

<h2>Overview</h2>
<p>
Verdex is a <strong>carbon credit trading platform</strong> built as a mini project.  
It allows users to <strong>buy, sell, and manage carbon credits</strong> in a transparent way.  
The system includes both a <strong>user portal</strong> and an <strong>admin dashboard</strong> to handle transactions and manage accounts.  
</p>

<h2>🚀 Features</h2>
<ul>
  <li><strong>User Authentication</strong> – Sign up, log in, and manage your profile.</li>
  <li><strong>Buy & Sell Credits</strong> – Trade carbon credits in a secure environment.</li>
  <li><strong>Transaction History</strong> – Track all your past trades.</li>
  <li><strong>Wallet/Balance System</strong> – Add and manage funds to purchase credits.</li>
  <li><strong>Notifications/Alerts</strong> – Stay updated on market activity.</li>
  <li><strong>Admin Portal</strong> – Manage users, credits, and approve/reject requests.</li>
  <li><strong>Secure Roles</strong> – Role-based access (<code>user</code> and <code>admin</code>).</li>
</ul>

<h2>🛠 Tech Stack</h2>
<ul>
  <li><strong>Frontend:</strong> React.js, Tailwind CSS</li>
  <li><strong>Backend:</strong> Node.js, Express.js</li>
  <li><strong>Database:</strong> PostgreSQL</li>
</ul>

<h2>📂 Project Structure</h2>
<pre>
verdex/
├── client/   # React.js code
├── server/   # Node.js + Express.js APIs
</pre>

<h2>⚡ Getting Started</h2>

<h3>Prerequisites</h3>
<ul>
  <li>Node.js & npm installed</li>
  <li>Database set up (PostgreSQL)</li>
</ul>

<h3>Installation</h3>
<ol>
  <li>
    Clone the repo
    <pre><code>git clone https://github.com/Hema-Nath-Reddy/Mini-Project-verdeX.git
cd verdex</code></pre>
  </li>
  <li>
    Install dependencies for both frontend and backend
    <pre><code>cd client && npm install
cd server && npm install</code></pre>
  </li>
  <li>
    Set up environment variables (<code>.env</code> file in backend)
    <pre><code>SUPABASE_URL=your_database_url
SUPABASE_ANON_KEY=your_secret_key</code></pre>
  </li>
  <li>
    Start backend server
    <pre><code>cd server
npm run dev</code></pre>
  </li>
  <li>
    Start frontend
    <pre><code>cd client
npm run dev</code></pre>
  </li>
</ol>

<h2>🔮 Future Improvements</h2>
<ul>
  <li>Add real-time market prices for credits</li>
  <li>Implement blockchain for transparent credit verification</li>
  <li>Deploy to cloud (Vercel/Netlify + Render/Heroku)</li>
</ul>

<h2>📜 License</h2>
<p>
This project is created for educational purposes as a <strong>mini project</strong>.
</p>
