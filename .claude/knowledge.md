# CLAUDE CODE — KNOWLEDGE BASE
# Bu dosyayı .claude/knowledge.md olarak her projeye ekle.
# Kaynak: Batuhan'ın araştırıp paylaştığı 50+ repo ve makale.

---

## 1. .CLAUDE/ KLASÖR YAPISI


```
proje/
├── CLAUDE.md                  # Proje hafızası (stack, kurallar, bilinen hatalar)
├── CLAUDE.local.md            # Kişisel overrides (gitignore'da)
└── .claude/
    ├── settings.json          # İzinler + hooks
    ├── settings.local.json    # Kişisel izin overrides
    ├── rules/                 # Modular kurallar (path bazlı aktive)
    │   ├── code-style.md
    │   ├── testing.md
    │   └── supabase.md
    ├── commands/              # Custom slash komutlar
    │   ├── fix-bug.md         # → /project:fix-bug
    │   ├── deploy.md          # → /project:deploy
    │   └── review.md          # → /project:review
    ├── skills/                # Auto-invoked workflows
    │   ├── security-review/
    │   │   └── SKILL.md
    │   └── supabase-helper/
    │       └── SKILL.md
    └── agents/                # Subagent personas (ileri seviye)
        └── code-reviewer.md
```



---

## 2. CLAUDE.md YAZIM KURALLARI

**MAX 200 SATIR. Daha uzunsa dikkat azalır.**

Her satır için test: "Bu olmadan Claude hata yapar mı?" — Hayırsa SİL.

Şunları yaz:
- Build/test/lint komutları
- Stack ve mimari kararlar
- Non-obvious gotcha'lar
- Import conventions, naming patterns
- Bilinen hatalar ve kaçınılacak patternlar

Şunları YAZMA:
- Linter/formatter config'e giden şeyler
- Link verebileceğin full dokümantasyon
- Teori açıklayan uzun paragraflar

**Güncelleme:** Claude hata yapınca söyle → "Update CLAUDE.md so this doesn't happen again."

---

## 3. SETTINGS.JSON — İZİNLER + HOOKS


```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(git *)",
      "Read", "Write", "Edit", "Glob", "Grep"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(del /s *)",
      "Read(.env)",
      "Read(.env.*)",
      "Write(.env)",
      "Write(.env.*)"
    ]
  },
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true"
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "echo 'Claude finished' && msg %username% 'Claude Code bitti!'"
      }]
    }]
  }
}
```



**Hook mantığı:**
- PostToolUse → Dosya düzenlenince otomatik çalışır (format, lint)
- PreToolUse → Komut çalışmadan önce (güvenlik kontrolü)
- Stop → Claude bitince bildirim
- CLAUDE.md %80 ihtimalle uyulur. Zorunlu kurallar için Hook kullan.

---

## 4. CUSTOM COMMANDS ŞABLONU


```markdown
---
description: Komutu açıkla. Claude bu açıklamayı okur.
argument-hint: [argüman açıklaması]
---

## Komut Adımları

!`git diff --name-only HEAD~1`   ← shell çalıştırır, output context'e girer

İstenen işlemi yap: $ARGUMENTS   ← kullanıcının yazdığı argüman

Şunları kontrol et:
1. Adım 1
2. Adım 2
```



---

## 5. SKILL ŞABLONU


```markdown
---
name: skill-adi
description: Ne zaman kullanılır. Claude bu açıklamayı okur ve otomatik çağırır.
allowed-tools: Read, Grep, Glob, Write
---

## Skill İçeriği

Claude'a ne yapacağını anlat.
@DETAYLI_REHBER.md   ← yan dosyayı referans al
```



**Komut vs Skill farkı:**
- Command → Sen çağırırsın (/project:fix-bug)
- Skill → Claude kendi çağırır (konuşma bağlamına göre)

---

## 6. AGENTS ŞABLONU


```markdown
---
name: agent-adi
description: Ne zaman spawn edilir. PROACTIVELY kullan.
model: sonnet          ← haiku/sonnet/opus seç
tools: Read, Grep, Glob
---

Sen deneyimli bir [rol]'sün.

[Agent'ın yapacakları]
```



**Ne zaman kullan:** Karmaşık, uzun, izole edilebilir görevler. Ana context'i temiz tutar.

---

## 7. MCP SERVER'LAR (öncelik sırasıyla)

### Tier 1 — Hemen Kur
| MCP | Ne Yapar | Link |
|-----|----------|------|
| Context7 | React/Supabase/Tailwind güncel docs | github.com/upstash/context7 |
| Supabase | DB işlemleri doğrudan | supabase.com/docs/guides/getting-started/mcp |

### Tier 2 — Hafta 1-2
| MCP | Ne Yapar | Link |
|-----|----------|------|
| Playwright | UI test, tarayıcı otomasyonu | github.com/executeautomation/mcp-playwright |
| Sequential Thinking | Karmaşık problemlerde adım adım | github.com/modelcontextprotocol/servers |

### Tier 3 — İlerde
| MCP | Ne Yapar | Link |
|-----|----------|------|
| n8n | Workflow otomasyonu | github.com/czlonkowski/n8n-mcp |
| Markdownify | PDF/image → markdown | github.com/zcaceres/markdownify-mcp |
| Tavily | AI için optimize arama | github.com/tavily-ai/tavily-mcp |

### Kurma

```bash
# settings.json'a ekle:
"mcpServers": {
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp@latest"]
  }
}
```



---

## 8. EN YARARLI SKİLLER (resmi + community)

### Resmi Anthropic
| Skill | Ne Yapar | Link |
|-------|----------|------|
| frontend-design | AI slop'tan kaçın, gerçek design | github.com/anthropics/skills/frontend-design |
| pdf | PDF işle, tablo çıkar | github.com/anthropics/skills/pdf |
| docx | Word doküman oluştur | github.com/anthropics/skills/docx |
| skill-creator | Meta-skill: 5dk'da yeni skill | github.com/anthropics/skills/skill-creator |

### Community
| Skill | Ne Yapar | Link |
|-------|----------|------|
| superpowers | 20+ test/debug skill | github.com/obra/superpowers |
| marketingskills | CRO, copywriting, SEO | github.com/coreyhaines31/marketingskills |
| context-optimization | Token maliyetini düşür | github.com/muratcankoylan/agent-skills-for-context-engineering |

---

## 9. GITHUB REPO'LARI (işe yarar olanlar)

### Claude Code Tooling
- **Task Master AI:** PRD → task → execute pipeline. github.com/eyaltoledano/claude-task-master
- **Codebase Memory MCP:** Codebase → kalıcı knowledge graph. github.com/DeusData/codebase-memory-mcp
- **rendergit:** Git repo → tek dosya (LLM'e vermek için). github.com/karpathy/rendergit
- **claude-deep-research-skill:** 8 fazlı araştırma. github.com/199-biotechnologies/claude-deep-research-skill
- **TDD Guard:** Test-first enforce eder. github.com/nizos/tdd-guard

### UI/UX
- **GSAP Skills:** Animasyon skill seti. github.com/greensock/gsap-skills

### Workflow
- **n8n:** 400+ entegrasyon, AI nodes. github.com/n8n-io/n8n
- **Firecrawl:** Web → LLM-ready data. github.com/mendableai/firecrawl

---

## 10. TOKEN TASARRUFU

| Kural | Tasarruf |
|-------|---------|
| Sonnet kullan, Opus KULLANMA | %80 |
| Tek büyük prompt, küçük parçalar değil | %50 |
| CLAUDE.md 200 satır altında tut | %30 |
| /clear yeni görev başlarken | %40 |
| /compact %60 dolulukta (otomatik %90'da) | %30 |
| Context7 ile doc yükle, tahmin etme | %60 |
| @dosya.md ile sadece gerekeni yükle | %40 |
| Planlamayı Claude.ai'da yap, Code'da uygula | %60 |

**Genel kural:** 1 büyük session yerine birden fazla temiz session daha iyi.

---

## 11. CLAUDE CODE POWER FEATURES

### Plan Mode
- Shift+Tab → Plan Mode aktive
- Büyük değişiklikler, multi-file refactor, mimari kararlar için
- "Önce planla ve göster, onaylayınca uygula" prompt'a ekle

### Subagents
- "Use subagents to figure out the payment flow" → izole context'te çalışır
- Ana context temiz kalır

### Faydalı komutlar
- `/clear` → context temizle
- `/compact` → context sıkıştır
- `/memory` → session hafızasını gör
- `!git status` → çıktı direkt context'e girer

---

## 12. 9 PROMPT ŞABLONU (skill geliştirmek için)

### Prompt 1: Skill Test

```
<role>Claude skill QA mühendisi</role>
<task>Şu skill'i 10 adversarial input ile test et</task>
Skill: [SKILL]
Output: Adversarial Set → Failure Log → Severity Rankings
```



### Prompt 2: Kısıtlama Yaz

```
Şu prompt'taki tüm belirsiz ifadeleri bul ve ölçülebilir kısıtlamaya çevir.
"Kısa ol" → YANLIŞ. "100 kelimeden az" → DOĞRU.
Prompt: [PROMPT]
```



### Prompt 3: Prompt Puanla

```
Bu prompt'u 5 boyutta puan ver (1-10):
1. Instruction clarity
2. Output format
3. Constraint strength
4. Edge case handling
5. Tone consistency
7 altı = launch riski.
Prompt: [PROMPT]
```



### Prompt 4: Self-Improving Skill

```
Bu skill'e feedback loop ekle. Her kullanımdan öğrensin.
Failure → specific prompt element'a bağla.
Skill: [SKILL]
```



---

## 13. DEPLOYMENT PIPELINE


```
Claude Code → git push → Vercel (otomatik, 30sn)
```



**Vercel env variables gereken her projede:**

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SENTRY_DSN=...        (opsiyonel)
VITE_STRIPE_KEY=...        (opsiyonel)
```


**Supabase Redirect URL:** Yeni domain eklenince Authentication → URL Configuration'a ekle.

---

## 14. ÜCRETSİZ ARAÇLAR (para harcama)

| Araç | Ne için | Limit |
|------|---------|-------|
| Vercel | Hosting + CDN | Free |
| Supabase | DB + Auth + Storage | Free |
| GitHub | Repo + CI/CD | Free |
| Resend | Email gönderme | 3K/ay |
| Sentry | Error tracking | 5K event/ay |
| UptimeRobot | Uptime monitoring | 50 monitor |
| Cloudflare | DNS + DDoS | Free |
| PostHog | Analytics | 1M event/ay |
| Lemon Squeezy | Ödeme (MoR) | %5 komisyon |

---

## 15. SAĞLIK NOTLARI (uzun session'larda)

- Saatte bir kalk, hareket et
- Göz egzersizi yap
- Ekran parlaklığını ayarla
- Günde max 10-14 saat. Sürdürülebilir tempo.
- Her 10-15 günlük yoğun çalışmaya daha sakin günler ekle

---

## KULLANIM

Yeni proje başlarken:
1. Bu dosyayı `.claude/knowledge.md` olarak projeye ekle
2. CLAUDE.md'de şunu ekle: `@.claude/knowledge.md` → Claude okur
3. Her yeni sohbette `BATUHAN_MASTER_CONTEXT.md` ile birlikte kullan

Bu dosya zamanla güncellenir. Yeni bir şey öğrenince ekle.
