# Payme integratsiya rejasi

Bu projectda Payme qo'shish uchun 3 qism kerak bo'ladi:

1. `Checkout link` - foydalanuvchini Payme to'lov sahifasiga yuborish
2. `Merchant API endpoint` - Payme serverlari bizning serverga JSON-RPC so'rov yuboradi
3. `Database` - buyurtma va transaction holatini ishonchli saqlash

## Rasmiy Payme talablaridan muhimlari

- Merchant API JSON-RPC 2.0 orqali ishlaydi.
- So'rovlar `POST` bo'lishi kerak.
- Javoblar HTTP `200` bilan qaytishi kerak.
- Payme `Authorization: Basic base64(login:password)` yuboradi.
- Transactionlarni doimiy xotirada saqlash kerak.
- Payme `CheckPerformTransaction`, `CreateTransaction`, `PerformTransaction`, `CancelTransaction`, `CheckTransaction`, `GetStatement` metodlarini ishlatadi.
- To'lov summasi tiyinlarda yuboriladi, ya'ni `149000 so'm` Payme uchun `14900000`.

Rasmiy hujjatlar:

- Merchant API: https://developer.help.paycom.uz/protokol-merchant-api/
- Interaction scheme: https://developer.help.paycom.uz/protokol-merchant-api/skhema-vzaimodeystviya/
- GET checkout URL: https://developer.help.paycom.uz/initsializatsiya-platezhey/otpravka-cheka-po-metodu-get/
- Sandbox: https://developer.help.paycom.uz/pesochnitsa/

## Bizda hozir nima tayyor

- `lib/payme.js` - Payme checkout URL yaratish helperi
- `.env.example` - Payme credential nomlari qo'shildi

## Keyingi majburiy qadam

Payme integratsiyani haqiqiy ishlatishdan oldin database qo'shamiz.

Tavsiya: `Supabase`.

Sabab:

- Vercel serverless muhitida `orders.json` ishlab chiqarish uchun ishonchli emas.
- Payme transactionlar qayta-qayta chaqirilishi mumkin.
- `CreateTransaction`, `PerformTransaction`, `CancelTransaction` idempotent bo'lishi kerak.

## Kerak bo'ladigan env variablelar

```text
PAYME_MERCHANT_ID=
PAYME_LOGIN=
PAYME_PASSWORD=
PAYME_CHECKOUT_URL=https://checkout.paycom.uz
```

Test uchun Payme sandbox ishlatilsa:

```text
PAYME_CHECKOUT_URL=https://checkout.test.paycom.uz
```

## Tavsiya qilingan ketma-ketlik

1. Supabase database qo'shish
2. `orders` va `payme_transactions` jadvallarini yaratish
3. Buyurtmani avval `pending_payment` status bilan saqlash
4. Checkout URL yaratish
5. `/api/payme` Merchant API endpoint qo'shish
6. Payme sandbox testlaridan o'tkazish
7. Production credentiallarni Vercel env'ga qo'shish
