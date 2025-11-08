from flask import Flask, render_template, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3, re, os
from itsdangerous import URLSafeTimedSerializer

app = Flask(__name__)
app.config['SECRET_KEY'] = 'replace-this-with-a-random-secret-key'

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
DB_FILE = 'users.db'

# ---------- Database Setup ----------
def init_db():
    if not os.path.exists(DB_FILE):
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            country_code TEXT,
            phone TEXT,
            password_hash TEXT
        )''')
        conn.commit()
        conn.close()

init_db()

# ---------- Routes ----------
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email').lower()
    country_code = data.get('country_code')
    phone = data.get('phone')
    password = data.get('password')

    if not re.match(r"^[\\w\\.-]+@[\\w\\.-]+\\.\\w{2,}$", email):
        return jsonify({'success': False, 'message': 'Invalid email address.'}), 400
    if not re.match(r"^[0-9]{6,15}$", phone):
        return jsonify({'success': False, 'message': 'Invalid phone number.'}), 400

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE email=? OR phone=?', (email, phone))
    if c.fetchone():
        return jsonify({'success': False, 'message': 'User already exists.'}), 409

    password_hash = generate_password_hash(password)
    c.execute('INSERT INTO users (name,email,country_code,phone,password_hash) VALUES (?,?,?,?,?)',
              (name, email, country_code, phone, password_hash))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Registration successful!'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    identifier = data.get('email_or_phone').lower()
    password = data.get('password')

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT name,email,password_hash FROM users WHERE email=? OR phone=?', (identifier, identifier))
    row = c.fetchone()
    conn.close()

    if row and check_password_hash(row[2], password):
        return jsonify({'success': True, 'message': f'Welcome {row[0]}!'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

@app.route('/request-reset', methods=['POST'])
def request_reset():
    data = request.json
    email = data.get('email_or_phone').lower()

    token = serializer.dumps(email)
    reset_link = f"{request.host_url}reset-password?token={token}"
    return jsonify({'success': True, 'message': 'Reset link generated.', 'reset_link': reset_link})

@app.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    if request.method == 'GET':
        token = request.args.get('token')
        return render_template('reset.html', token=token)
    else:
        token = request.form['token']
        new_password = request.form['password']
        try:
            email = serializer.loads(token, max_age=3600)
        except:
            return 'Invalid or expired token.'

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('UPDATE users SET password_hash=? WHERE email=?',
                  (generate_password_hash(new_password), email))
        conn.commit()
        conn.close()
        return 'Password reset successful! You can close this page and log in.'

if __name__ == '__main__':
    app.run(debug=True)
