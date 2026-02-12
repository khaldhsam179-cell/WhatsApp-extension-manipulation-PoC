const express = require('express');
const app = express();
app.use(express.json());

// قاعدة بيانات مؤقتة للحسابات
let accountsDB = [];

// --- الواجهة الرئيسية: سايكو VIP ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>سايكو VIP</title>
        <style>
            body { background: #0d1117; color: white; font-family: sans-serif; text-align: center; padding: 20px; }
            .card { background: #161b22; padding: 25px; border-radius: 20px; border: 1px solid #30363d; max-width: 400px; margin: auto; }
            .btn { width: 100%; padding: 15px; margin: 10px 0; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; color: white; font-size: 16px; }
            .btn-blue { background: #1f6feb; }
            .btn-red { background: #da3633; }
            .btn-green { background: #238636; }
            input { width: 90%; padding: 10px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #30363d; background: #0d1117; color: white; }
            .user-item { background: #1c2128; padding: 10px; margin-top: 10px; border-radius: 10px; border: 1px solid #30363d; display: flex; justify-content: space-between; align-items: center; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>👑 سايكو VIP</h1>
            <p>التحكم الكامل في الحسابات</p>
            <input id="n" placeholder="الاسم">
            <input id="p" placeholder="كلمة السر">
            <button class="btn btn-blue" onclick="add()">🆕 فتح حساب جديد</button>
            <button class="btn btn-red" onclick="alert('اضغط شحن من قائمة الحسابات')">💰 شحن رصيد</button>
            <button class="btn btn-green" onclick="alert('سيتم الحظر قريباً')">🚫 حظر حساب</button>
        </div>
        <div id="list" style="max-width:400px; margin:20px auto; text-align:right;"></div>
        <script>
            async function add() {
                const n = document.getElementById('n').value;
                const p = document.getElementById('p').value;
                if(!n || !p) return alert("املا البيانات");
                await fetch('/api/admin/add', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name: n, pass: p })
                });
                location.reload();
            }
            async function charge(acc) {
                const amt = prompt("المبلغ:");
                if(amt) {
                    await fetch('/api/admin/charge', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ acc, amt })
                    });
                    location.reload();
                }
            }
            fetch('/api/admin/list').then(r => r.json()).then(data => {
                document.getElementById('list').innerHTML = data.map(u => \`
                    <div class="user-item">
                        <div><b>\${u.name}</b><br><small>ID: \${u.acc} | رصيد: \${u.balance}</small></div>
                        <button onclick="charge('\${u.acc}')" style="background:#238636; color:white; border:none; padding:5px 10px; border-radius:5px;">شحن</button>
                    </div>
                \`).join('');
            });
        </script>
    </body>
    </html>
    `);
});

// --- APIs ---
app.post('/api/admin/add', (req, res) => {
    const acc = Math.floor(1000000 + Math.random() * 8000000).toString();
    accountsDB.push({ acc, name: req.body.name, pass: req.body.pass, balance: 0 });
    res.json({
