const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const xlsx = require("xlsx");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "mohan_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// ✅ Utility: Save a session message
function setMessage(req, type, text) {
  req.session.message = { type, text };
}

// ✅ Utility: Get and clear message
function getMessage(req) {
  const msg = req.session.message;
  req.session.message = null;
  return msg;
}

// ✅ Root route — Login page
app.get("/", (req, res) => {
  if (req.session.loggedIn) return res.redirect("/index");
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// ✅ API endpoint to fetch messages (used by frontend JS)
app.get("/message", (req, res) => {
  const msg = getMessage(req);
  res.json(msg || {});
});

// ✅ Login handler
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    setMessage(req, "error", "Please enter both email and password!");
    return res.redirect("/");
  }

  try {
    const usersFile = path.join(__dirname, "users.xlsx");
    if (!fs.existsSync(usersFile)) {
      setMessage(req, "error", "No users found. Please register first!");
      return res.redirect("/register");
    }

    const workbook = xlsx.readFile(usersFile);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const users = xlsx.utils.sheet_to_json(sheet);

    const user = users.find(
      (u) => (u.Email === email || u.Phone === email) && u.Password === password
    );

    if (user) {
      req.session.loggedIn = true;
      req.session.user = user;
      setMessage(req, "success", "Login successful! Welcome back 👋");
      return res.redirect("/index");
    } else {
      setMessage(req, "error", "Invalid credentials or not registered!");
      return res.redirect("/");
    }
  } catch (err) {
    console.error("Login error:", err);
    setMessage(req, "error", "Error during login. Try again!");
    return res.redirect("/");
  }
});

// ✅ Register handler
app.post("/register", (req, res) => {
  const { email, phone, password } = req.body;

  if (!email || !phone || !password) {
    setMessage(req, "error", "All fields are required!");
    return res.redirect("/register");
  }

  const usersFile = path.join(__dirname, "users.xlsx");
  let workbook, sheet;

  try {
    if (fs.existsSync(usersFile)) {
      workbook = xlsx.readFile(usersFile);
      sheet = workbook.Sheets[workbook.SheetNames[0]];
    } else {
      workbook = xlsx.utils.book_new();
      sheet = xlsx.utils.json_to_sheet([]);
      xlsx.utils.book_append_sheet(workbook, sheet, "Users");
    }

    const users = xlsx.utils.sheet_to_json(sheet);
    if (users.some((u) => u.Email === email || u.Phone === phone)) {
      setMessage(req, "error", "User already exists! Please log in.");
      return res.redirect("/");
    }

    users.push({ Email: email, Phone: phone, Password: password });
    const newSheet = xlsx.utils.json_to_sheet(users);
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;
    xlsx.writeFile(workbook, usersFile);

    setMessage(req, "success", "Registration successful! Please log in 🎉");
    return res.redirect("/");
  } catch (err) {
    console.error("Registration error:", err);
    setMessage(req, "error", "Error during registration. Try again!");
    return res.redirect("/register");
  }
});

// ✅ Protected portfolio page
app.get("/index", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    setMessage(req, "error", "Please log in first!");
    res.redirect("/");
  }
});

// ✅ Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
