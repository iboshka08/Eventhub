# EventHub API

EventHub — Toshkentdagi tadbirlarni boshqarish, foydalanuvchilarni email orqali tasdiqlash va tadbirlarga joy bron qilish uchun yaratilgan REST API.

Loyiha Node.js va Express asosida ishlab chiqilgan. Ma'lumotlar bazasi o'rniga `data/` papkasidagi JSON fayllar ishlatiladi.

## Loyiha imkoniyatlari

- Foydalanuvchini ro'yxatdan o'tkazish
- Email orqali 6 xonali OTP kod bilan tasdiqlash
- Login va parolni tekshirish
- Parolni tiklash
- Parolni o'zgartirish
- Foydalanuvchi profilini boshqarish
- Tadbir yaratish, ko'rish, yangilash va o'chirish
- Tadbirlarni qidirish va filterlash
- Tadbirlarni saralash va pagination
- Tadbirga joy bron qilish
- Bronni yangilash va bekor qilish
- Tadbir o'chirilganda bronlarni bekor qilish
- Bronlar bo'yicha statistika
- Email orqali tasdiqlash va chipta xabarlarini yuborish

## Texnologiyalar

- Node.js
- Express
- Joi
- bcrypt
- Nodemailer
- dotenv
- JSON fayllar
- fs/promises
- nodemon (development)

## O'rnatish

Repository'ni yuklab oling:

```bash
git clone https://github.com/iboshka08/Eventhub.git
cd Eventhub