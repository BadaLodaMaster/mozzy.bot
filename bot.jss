const express = require('express');
const session = require('express-session');
const mineflayer = require('mineflayer');

const app = express();
const port = 3000;
let bot = null;

// Use session for login
app.use(session({
  secret: 'your-very-secret-key', // 🔐 Change this
  resave: false,
  saveUninitialized: true
}));

// Middleware to protect routes
function checkAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.redirect('/login');
}

// Serve login form
app.get('/login', (req, res) => {
  res.send(`
    <h2>🔐 Bot Control Login</h2>
    <form method="POST" action="/login">
      <input type="password" name="password" placeholder="Enter password" required/>
      <button type="submit">Login</button>
    </form>
  `);
});

// Handle login form
app.use(express.urlencoded({ extended: true }));
app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === 'your-secret-password') { // 🛠️ Change this
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.send('❌ Incorrect password. <a href="/login">Try again</a>');
  }
});

// Bot control page (protected)
app.get('/', checkAuth, (req, res) => {
  res.send(`
    <h1>🕹️ Mineflayer Bot Control</h1>
    <button onclick="fetch('/login-bot').then(r => r.text()).then(alert)">Login Bot</button>
    <button onclick="fetch('/logout-bot').then(r => r.text()).then(alert)">Logout Bot</button>
  `);
});

app.get('/login-bot', checkAuth, (req, res) => {
  if (bot) return res.send('⚠️ Bot already online');

  bot = mineflayer.createBot({
    host: 'bucket.qbitnode.com',
    port: 5060,
    username: 'Itx_Mozzy',
    auth: 'offline',
    version: false
  });

  bot.once('login', () => {
    console.log('✅ Bot logged in');
    bot.chat('/login Jeet@Sujhee');
  });

  bot.on('spawn', () => console.log('🚀 Bot spawned'));
  bot.on('end', () => {
    console.log('❌ Bot disconnected');
    bot = null;
  });

  bot.on('error', err => console.log('💥 Error:', err));

  res.send('✅ Bot login triggered');
});

app.get('/logout-bot', checkAuth, (req, res) => {
  if (!bot) return res.send('⚠️ Bot not online');
  bot.quit();
  bot = null;
  res.send('👋 Bot logout triggered');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🌐 Server running on http://localhost:${port}`);
  console.log(`🌍 Use Codespace URL or tunnel to access remotely`);
});
