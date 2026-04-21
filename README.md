# Telegram Web Store Starter

Bu loyiha boshlovchi uchun Telegram ichida ishlaydigan web store'ning birinchi MVP versiyasi.

## Hozir nimalar tayyor

- mahsulotlar katalogi
- savat
- buyurtma formasi
- lokal serverga buyurtma yuborish
- buyurtmalarni `data/orders.json` ichida saqlash

## Loyihani ishga tushirish

Sizning PowerShell ba'zan `npm` ni bloklashi mumkin. Shuning uchun eng ishonchli variant:

```powershell
& "C:\Program Files\nodejs\node.exe" server.js
```

Agar `npm` ishlasa, bunday ham bo'ladi:

```powershell
npm start
```

Keyin brauzerda oching:

```text
http://localhost:3000
```

## Siz ko'rayotgan qismlar

- `server.js` - server va API
- `public/index.html` - sahifa tuzilishi
- `public/styles.css` - dizayn
- `public/app.js` - mahsulot, savat va buyurtma logikasi
- `data/orders.json` - kelgan buyurtmalar

## Telegram bilan qanday ulaymiz

Keyingi bosqichda quyidagini qilamiz:

1. BotFather orqali bot token olamiz
2. Bu loyihani internetga chiqaramiz
3. Telegram botga Web App tugma qo'shamiz
4. Tugma bosilganda shu sahifa Telegram ichida ochiladi

## Telegram bot ulanishi

Loyihaga oddiy Telegram bot fayli qo'shildi:

- `bot.js` - `/start` kelganda `Do'konni ochish` tugmasini yuboradi
- `.env.example` - token va web app link uchun namuna

### Sozlash

1. `.env.example` fayldan nusxa olib `.env` yarating
2. quyidagilarni yozing:

```text
BOT_TOKEN=sizning_bot_tokeningiz
WEB_APP_URL=https://sizning-public-linkingiz
ADMIN_CHAT_ID=sizning_chat_id_ixtiyoriy
```

### Botni ishga tushirish

```powershell
& "C:\Program Files\nodejs\node.exe" bot.js
```

Yoki `npm` ishlasa:

```powershell
npm run bot
```

## Muhim cheklov

Telegram Web App `localhost` bilan Telegram ichida ochilmaydi.
Telegram ichida ishlashi uchun sizga `https` bilan ochiladigan public URL kerak bo'ladi.

## Vercel deploy haqida

Vercel uchun loyiha moslashtirilgan:

- frontend `public/` ichidan servis qilinadi
- buyurtma API `api/order.js` orqali ishlaydi
- production muhitda buyurtma lokal faylga emas, Telegram chatga yuboriladi

Shuning uchun Vercel'da quyidagilarni environment variable sifatida kiriting:

```text
BOT_TOKEN=sizning_bot_tokeningiz
ADMIN_CHAT_ID=sizning_admin_chat_id
```

`WEB_APP_URL` deploy bo'lgandan keyin chiqadigan `https://...vercel.app` manzil bo'ladi. Uni keyin `.env` ichida va Vercel settings ichida yangilaysiz.

## Payme integratsiyasi

Payme uchun boshlang'ich helper va yo'riqnoma qo'shildi:

- `lib/payme.js` - Payme checkout URL yaratish
- `docs/payme-integration.md` - integratsiya rejasi

To'liq Payme ulashdan oldin database qo'shish kerak. Payme transactionlarni doimiy saqlashni talab qiladi, Vercel'dagi vaqtinchalik fayl saqlash bunga mos emas.

Masalan keyinroq:

- VPS hosting
- Render
- Railway
- Vercel
- yoki vaqtincha tunnel servisi

Hozirgi `http://localhost:3000` link faqat sizning kompyuteringiz brauzerida test uchun ishlaydi.

## Muhim

Bu birinchi MVP. Hozircha:

- mahsulotlar kod ichida yozilgan
- admin panel yo'q
- to'lov integratsiyasi yo'q
- Telegram bot kodi qo'shilgan, lekin ishlashi uchun `.env` va public `https` link kerak

Lekin aynan shu oddiy versiya keyingi bosqichlar uchun juda yaxshi poydevor bo'ladi.
