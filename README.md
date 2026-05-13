# Zone Oracle — Production Setup Guide
> From zero to selling in ~2 hours

---

## โครงสร้างไฟล์

```
zone-oracle/
├── components/
│   └── ZoneOracleApp.tsx      ← แอปหลัก (live price + zones + analysis)
├── lib/
│   ├── useLivePrice.ts        ← WebSocket hook (TwelveData → Finnhub → Simulation)
│   └── useSubscription.ts     ← ดึง subscription status จาก Clerk
├── pages/
│   ├── index.tsx              ← Landing page
│   ├── pricing.tsx            ← Pricing + Stripe checkout
│   ├── _app.tsx               ← Clerk provider
│   ├── sign-in/[[...index]]   ← Clerk sign-in UI
│   ├── sign-up/[[...index]]   ← Clerk sign-up UI
│   ├── dashboard/index.tsx    ← Protected app (paywall)
│   └── api/
│       ├── stripe/
│       │   ├── create-checkout.ts  ← สร้าง Stripe checkout session
│       │   └── webhook.ts         ← รับ events จาก Stripe → update Clerk
│       └── subscription/
│           └── status.ts          ← เช็ค subscription status
├── styles/globals.css
├── middleware.ts              ← Clerk route protection
├── next.config.js
├── .env.local.example         ← Copy → .env.local แล้วใส่ keys
└── package.json
```

---

## STEP 1 — ติดตั้ง dependencies

```bash
cd zone-oracle
npm install
```

---

## STEP 2 — สมัคร API Keys (ฟรีทั้งหมด ยกเว้น Stripe ที่ไม่มีค่าใช้จ่ายจนกว่าจะมีรายได้)

### A) TwelveData (Real-time XAUUSD price)
1. ไปที่ https://twelvedata.com
2. สมัครฟรี → ได้ 800 req/day (เพียงพอสำหรับ WebSocket)
3. Dashboard → API Keys → Copy key

### B) Clerk (Auth — Login/Register)
1. ไปที่ https://clerk.com → Create application
2. ตั้งชื่อ "Zone Oracle" → เลือก Email + Google
3. API Keys → Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` และ `CLERK_SECRET_KEY`

### C) Stripe (Payments)
1. ไปที่ https://stripe.com → สมัคร (ต้องมีบัญชีธนาคารไทย)
2. Developers → API Keys → Copy test keys ก่อน
3. Products → Add product:
   - "Zone Oracle Monthly" → ฿990/เดือน → Copy Price ID
   - "Zone Oracle Yearly"  → ฿7,990/ปี   → Copy Price ID
4. Webhooks → Add endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `customer.subscription.*` + `invoice.payment_failed`
   - Copy Webhook Secret

---

## STEP 3 — ตั้งค่า Environment Variables

```bash
cp .env.local.example .env.local
```

แก้ `.env.local`:
```env
NEXT_PUBLIC_TWELVEDATA_KEY=your_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## STEP 4 — รัน Local

```bash
npm run dev
# เปิด http://localhost:3000
```

ทดสอบ Stripe webhook ด้วย Stripe CLI:
```bash
npm install -g stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## STEP 5 — Deploy บน Vercel (30 นาที)

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (ครั้งแรก)
vercel

# Follow prompts:
# → Set up and deploy? Y
# → Which scope? (เลือก account ของคุณ)
# → Link to existing project? N
# → Project name: zone-oracle
# → Directory: ./
# → Override settings? N
```

### ตั้งค่า Environment Variables บน Vercel:
1. ไปที่ vercel.com → Project → Settings → Environment Variables
2. เพิ่ม **ทุก** key จาก `.env.local` (ยกเว้น NEXT_PUBLIC_APP_URL ให้เปลี่ยนเป็น domain จริง)

### Deploy production:
```bash
vercel --prod
```

---

## STEP 6 — ผูก Custom Domain

1. Vercel Dashboard → Project → Domains → Add Domain
2. พิมพ์ domain เช่น `zone-oracle.com`
3. ไปที่ DNS provider (Cloudflare/GoDaddy) → เพิ่ม CNAME ที่ Vercel บอก
4. แก้ `NEXT_PUBLIC_APP_URL=https://zone-oracle.com` ใน Vercel env vars

---

## STEP 7 — เปลี่ยน Stripe เป็น Live Mode

1. Stripe Dashboard → Toggle "Test mode" → Live mode
2. สร้าง Products และ Price IDs ใหม่ใน live mode
3. อัพเดท Vercel environment variables ด้วย live keys
4. อัพเดท Webhook endpoint ใน Stripe live mode

---

## Flow การทำงาน

```
ผู้ใช้เข้า zone-oracle.com
         ↓
    Landing page (index.tsx)
         ↓ Sign Up (Clerk)
    สร้าง account
         ↓
    /dashboard → ตรวจ subscription
         ↓ ไม่มี subscription
    Paywall → /pricing
         ↓ เลือก plan
    Stripe Checkout (create-checkout.ts)
         ↓ จ่ายเงิน
    Stripe Webhook → อัพเดท Clerk metadata (isActive: true)
         ↓
    /dashboard → โหลด ZoneOracleApp
         ↓
    useLivePrice() → TwelveData WebSocket → Real-time XAUUSD
         ↓
    กราฟอัพเดทตามราคาจริง ✅
```

---

## ราคาค่าใช้จ่าย/เดือน (ตอนเริ่ม)

| Service | Free Tier | เมื่อโตขึ้น |
|---------|-----------|------------|
| Vercel | ฟรี (hobby) | $20/เดือน (pro) |
| Clerk | ฟรี 10,000 MAU | $25/เดือน |
| TwelveData | ฟรี 800 req/day | $8/เดือน |
| Stripe | ฟรี (3.4% + ฿10 ต่อ txn) | เหมือนกัน |
| Domain | ~฿500/ปี | — |

**รวม: ~฿500/ปี จนกว่าจะมี users จริงๆ**

---

## Tips ขายลูกค้า

- ใช้ **7-day free trial** (ตั้งใน Stripe → Trial period days: 7)
- ราคา **฿990/เดือน** หรือ **฿7,990/ปี** (ประหยัด 33%)  
- เพิ่ม LINE OA สำหรับ support
- ทดสอบกับ `4242 4242 4242 4242` (Stripe test card) ก่อน go live
