# RaverUp — CLAUDE.md

Her Claude Code session'ında bu dosyayı oku. Proje bağlamı ve davranış kuralları burada.

---

## Proje Kimliği

**RaverUp** — Her türden sanatçı ve venue için komisyonsuz, güven altyapısı üzerine kurulu DJ-venue booking platformu. Tüm müzik türleri ve tüm sahne büyüklükleri — underground'dan mainstream'e, küçük bardan festivale.

- **Domain:** raverup.online
- **Repo:** outlier-byte/raverup
- **Brand rengi:** #FF2D78 (hot pink) — bu değişmez
- **Background:** #050505
- **Card:** #0d0d0d
- **Border:** #1f1f1f
- **Teal (başarı):** #00d4aa
- **Typography:** Space Grotesk (heading) + Inter (body)

---

## Stack

| Katman | Teknoloji |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| CDN / Edge | Cloudflare |
| Ödeme | Paddle |
| AI | Claude API (claude-sonnet-4-20250514) |
| Email | Resend |
| Deployment | Cloudflare Pages |

---

## Davranış Kuralları (Karpathy Prensipleri — RaverUp'a Uyarlanmış)

### 1. En İyi Yorumu Yap, Devam Et

Belirsizlik varsa durma — en mantıklı yorumu yap ve ilerle. Ne yaptığını ve neden öyle yorumladığını kısaca belirt, sonra devam et.

Ancak şunlarda dur ve sor:
- Veri kaybı riski varsa (DROP, DELETE, migration)
- Güven sistemi veya ödeme akışı değiştiriliyorsa
- Birden fazla yorumun sonuçları birbirinden çok farklıysa

### 2. Sadece İsteneni Yap

- İstenen özelliğin dışına çıkma.
- "Şunu da eklesem iyi olur" düşüncesiyle kod yazma.
- İstenmeyen abstraction, flexibility veya configurability ekleme.
- 200 satırla yazılabilecekse 50'ye indir — şişirme.

**Test:** Kıdemli bir mühendis bu kodu görse "neden bu kadar karmaşık?" der mi? Diyorsa sadeleştir.

### 3. Cerrahi Değişiklik

Sadece değiştirmen gereken kısmı değiştir:
- Yanındaki kodu "iyileştirme" amaçlı dokunma.
- Çalışan kodu refactor etme.
- Mevcut kod stiline uymayan değişiklik yapma.
- İlgisiz dead code görürsen sil değil, yorum olarak belirt.

Kendi değişikliklerin orphan bıraktığı import/variable/function'ı temizle. Başkasının dead code'una dokunma.

**Test:** Her değiştirilen satır doğrudan kullanıcının isteğine bağlanabilmeli.

### 4. Adım Adım Plan, Doğrula

Çok adımlı işlerde önce kısa plan yaz:

```
1. [Adım] → kontrol: [ne doğrulanır]
2. [Adım] → kontrol: [ne doğrulanır]
3. [Adım] → kontrol: [ne doğrulanır]
```

Her adımı tamamlayıp doğruladıktan sonra bir sonrakine geç.

---

## Veritabanı Kuralları

```
reliability_events  → Sadece service_role key ile Edge Function'dan yaz. Frontend'den asla.
payments.amount     → INTEGER (cents). Asla DECIMAL veya FLOAT.
Timestamps          → Hepsi UTC.
SELECT *            → Yasak. Sadece gerekli kolonları çek.
N+1 sorgu           → Yasak. Loop içinde DB sorgusu yok.
RLS                 → Her tablo için zorunlu. Frontend-only kontrol yetmez.
```

## Ödeme Kuralları

```
Booking "completed" → Sadece Paddle webhook'tan gelir. Frontend'den status değiştirme yok.
platform_fee_cents  → Her zaman ayrı tutulur.
Duplicate ödeme     → Idempotency key ile önle. DB unique constraint + button disable.
```

## Güven Sistemi Kuralları

```
Güvenilirlik skoru  → Frontend'de hesaplanmaz. Edge Function hesaplar, DB'ye yazar, frontend okur.
Karşılıklı değerlendirme → İki taraf da onaylamadan "tamamlandı" sayılmaz.
Doluluk oranı       → DJ + venue ikisi de onaylarsa gösterilir. Tek taraf yazamaz.
Sahte booking       → Aynı IP'den DJ + venue = otomatik flag.
```

## Mühendislik Prensipleri

| Prensip | Uygulama |
|---|---|
| Idempotency | Duplicate booking / ödeme önleme. Button disable + DB unique constraint. |
| Retry + Backoff | API fail: 1sn, 2sn, 4sn + jitter. Max 3 deneme. |
| Timeout | Claude API: 30sn. Supabase: 10sn. Paddle webhook: 10sn. |
| ACID Transaction | Booking + ödeme + sinyal = tek transaction. Yarım işlem yok. |
| Race Condition | DB unique constraint + app-level lock. |
| No Silent Fail | Boş catch bloğu yasak. Her hata loglanır + kullanıcıya gösterilir. |
| Webhook Only | Paddle ödeme durumu sadece webhook'tan. Frontend'den asla. |

---

## Tasarım Kuralları

- SVG icons only — Heroicons veya Lucide
- `cursor-pointer` tüm clickable elementlerde
- 4.5:1 kontrast minimum (WCAG 2.1 AA)
- Mobile-first: 375 / 768 / 1024 / 1440px
- **NO** AI purple/pink gradient klişesi
- Primary aksan rengi: `#FF2D78` — başka renk kullanma

---

## Güvenlik Çalışıyorsa İşareti

Bu kurallar işe yarıyorsa:
- Diff'lerde sadece istenen değişiklikler görünür
- Kod ilk seferinde sade gelir, rewrite gerekmez
- Ambiguity'de yorum yapılır ve belirtilir, bloke olunmaz
- Ödeme ve güven sistemi hiçbir zaman frontend'den manipüle edilemez

---

*RaverUp CLAUDE.md — Batuhan (Outlier) x Cypher | Mayıs 2026*
