# EventHub API

EventHub — tadbirlarni ko'rish, foydalanuvchilarni email orqali tasdiqlash va tadbirlarga joy bron qilish uchun Node.js + Express REST API.

Ma'lumotlar bazasi o'rniga `data/` ichidagi JSON fayllar ishlatiladi. Barcha o'qish/yozish `fs/promises` orqali `src/utils/fileDb.js` dan bajariladi.

## Texnologiyalar

- Node.js
- Express
- Joi
- bcrypt
- Nodemailer
- dotenv
- JSON fayllar
- nodemon (dev)

## O'rnatish

```bash
npm i
cp .env.example .env
npm run dev
```

Windows PowerShell uchun:

```powershell
Copy-Item .env.example .env
npm run dev
```

Default server: `http://localhost:3000`

Tekshirish:

```http
GET http://localhost:3000/api/health
```

Javob:

```json
{ "status": "ok" }
```

## Email sozlamasi

`.env.example` dagi `MAIL_MODE=json` bilan loyiha SMTP credentialsiz ham ishlaydi; email xabari Nodemailer orqali test transportga yuborilib konsolda qayd etiladi.

Haqiqiy email yuborish uchun:

```env
MAIL_MODE=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your_app_password
MAIL_FROM="EventHub <your@email.com>"
```

Gmail ishlatilsa oddiy parol emas, **App Password** ishlating. `.env` fayl `.gitignore` ichida va repozitoriyga yuklanmasligi kerak.

## Loyiha strukturasi

```text
eventhub-api/
├── data/
│   ├── users.json
│   ├── codes.json
│   ├── events.json
│   └── bookings.json
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── validations/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── postman_collection.json
└── README.md
```

## Endpointlar

| Method | Endpoint | Vazifa |
|---|---|---|
| GET | `/api/health` | Server holati |
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/verify-email` | Emailni OTP bilan tasdiqlash |
| POST | `/api/auth/resend-code` | Tasdiqlash kodini qayta yuborish |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Parol tiklash kodini so'rash |
| POST | `/api/auth/reset-password` | Parolni tiklash |
| GET | `/api/users/:id` | Profil + faol bronlar soni |
| PUT | `/api/users/:id` | Ismni yangilash |
| PUT | `/api/users/:id/password` | Parolni o'zgartirish |
| DELETE | `/api/users/:id` | Akkauntni o'chirish |
| GET | `/api/users/:id/bookings` | Foydalanuvchi bronlari |
| POST | `/api/events` | Tadbir yaratish |
| GET | `/api/events` | Tadbirlar ro'yxati/filter/search/sort/pagination |
| GET | `/api/events/:id` | Bitta tadbir + band joylar |
| PUT | `/api/events/:id` | Tadbirni yangilash |
| DELETE | `/api/events/:id` | Tadbirni o'chirish va bronlarni bekor qilish |
| GET | `/api/events/:id/bookings` | Tadbir ishtirokchilari va statistika |
| POST | `/api/bookings` | Bron yaratish va email chipta |
| GET | `/api/bookings` | Barcha bronlar + filter/pagination |
| GET | `/api/bookings/:id` | Bitta bron tafsilotlari |
| PUT | `/api/bookings/:id` | Bron joylari sonini o'zgartirish |
| PUT | `/api/bookings/:id/cancel` | Bronni bekor qilish |
| DELETE | `/api/bookings/:id` | Bronni butunlay o'chirish |

Jami: **24 endpoint**.

## Asosiy body namunalari

### Register

```json
{
  "full_name": "Ali Valiyev",
  "email": "ali@mail.uz",
  "password": "Secret123"
}
```

### Verify email

```json
{
  "email": "ali@mail.uz",
  "code": "482913"
}
```

### Login

```json
{
  "email": "ali@mail.uz",
  "password": "Secret123"
}
```

### Event yaratish

```json
{
  "title": "Node.js Tashkent Meetup #13",
  "description": "Backend va Express haqida",
  "category": "meetup",
  "city": "Toshkent",
  "venue": "IT Park",
  "starts_at": "2027-11-15T18:00:00.000Z",
  "price": 0,
  "capacity": 120
}
```

### Bron yaratish

```json
{
  "user_id": 1,
  "event_id": 1,
  "seats": 2
}
```

## Tadbirlar query parametrlari

Misol:

```http
GET /api/events?search=node&city=Toshkent&free=true&sort=date_asc&page=1&limit=5
```

Qo'llab-quvvatlanadi:

- `page` — default `1`
- `limit` — default `10`, maksimum `50`
- `search` — title/description qidiruvi
- `category` — `concert | meetup | standup | workshop | sport | other`
- `city` — shahar filtri
- `free=true` — faqat bepul tadbirlar
- `sort` — `date_asc | date_desc | price_asc | price_desc`
- `all=true` — o'tgan tadbirlarni ham ko'rsatadi

## Bronlar query parametrlari

```http
GET /api/bookings?status=confirmed&event_id=1&page=1&limit=10
```

## Muhim qoidalar

- Parollar va OTP kodlari `bcrypt` bilan hash qilinadi.
- Response ichida `password` qaytarilmaydi.
- Login xatosi email/parolni alohida oshkor qilmaydi.
- Forgot-password email mavjudligini oshkor qilmaydi.
- Joi validatsiyada `abortEarly: false` va `stripUnknown: true` ishlatiladi.
- Foydalanuvchi bitta tadbirga faqat bitta faol bron qila oladi.
- Bir bron uchun 1–5 ta joy mumkin.
- Tadbirga 24 soatdan kam qolsa bronni cancel qilib bo'lmaydi.
- Email yuborishdagi xato asosiy so'rovni yiqitmaydi; tadbir o'chirilganda xatlar `Promise.allSettled` bilan yuboriladi.

## Postman

`postman_collection.json` ni Postman ichida **Import** qiling. Collection variable `baseUrl` default `http://localhost:3000`.
