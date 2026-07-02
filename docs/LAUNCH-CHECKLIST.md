# My Home Budapest — indulási checklist

Élő teendőlista. Jelölés: `[x]` kész · `[ ]` hátravan.
Felelős: 💻 = kód (fejlesztés) · 👤 = megrendelő (Krisztina/te) · ⏸️ = döntésre/asszetre vár.

---

## A) SEO + finomítás (💻 kód — sorban haladunk)

- [x] **hreflang tag-ek** — HU⇄EN + x-default minden fő oldalon (home/lista/kapcsolat/ingatlan)
- [x] **Sitemap élesre** — a valódi Supabase ingatlanokból generálja
- [x] **Alap OG-kép** — a logó az alap OG-kép (ingatlan-oldal a saját fotóját használja). *Opció: külön 1200×630 navy/arany bannert később*
- [x] **Favicon + app-ikonok** — a logóból (icon.png + apple-icon.png)
- [x] **LocalBusiness JSON-LD** a főoldalon — RealEstateAgent (cégnév, telefon, e-mail, Budapest)
- [x] **Canonical** minden fő oldalon (a hreflang-gal együtt)
- [ ] Opcionális: **Lighthouse audit** — konkrét sebesség-számok (LCP/CLS), majd finomítás

## B) Teljesítmény / stabilitás

- [x] Cache-architektúra: SSG + on-demand ISR (CDN-gyors)
- [x] Képek: next/image + WebP + Supabase Storage
- [x] Korábbi 7-10s lassulás megoldva
- [ ] ⏸️ **Supabase Pro ($25/hó)** — az ingyenes csomag 7 nap tétlenség után elalszik → 24/7-hez ajánlott *(Kristina döntés)*
- [ ] 👤 Hero/Rólunk/CTA képek cseréje **Unsplash placeholderről** valódi, optimalizált fotókra

## C) Google / helyi jelenlét (👤 operatív)

- [x] Beágyazott Google Maps (lista + ingatlan oldal) élesben látszik
- [x] Maps API kulcs Vercelen + referrer-korlátozás + Geocoding API
- [ ] 👤 **Google Business Profile (cégprofil)** — hogy vállalkozásként megjelenjetek a Google Maps-en és keresésben (cím, telefon, nyitvatartás, fotók). Ez adja a **Google értékelés linket** is az automatizálásokhoz
- [ ] 👤 **Google Search Console** — oldal hitelesítése + sitemap beküldése (indexelés követése)

## D) Lead-folyamat lezárása (👤 GHL)

- [x] Lead → GHL CRM élesben (4 pipeline, retry)
- [x] Régi inquiry-rendszer eltávolítva (GHL az egyetlen forrás)
- [ ] 👤 **GHL email-domain** beállítása (DKIM/SPF) — az automatizálások előfeltétele
- [ ] 👤 **Pipeline automatizálások** felépítése a GHL-ben (lásd `docs/GHL-AUTOMATIONS.md`)
- [ ] ⏸️ **Gemini billing** — az AI-mező kinyeréshez (~$10-25 egyszeri) *(Kristina döntés)*
- [ ] ⏸️ **GHL chat widget** — a snippet beépítése a layoutba *(a snippetre vár)*

## E) Tartalom / apróságok

- [x] Kétnyelvű oldal, admin, kedvencek, GDPR/cookie, 404, kapcsolat-CTA-k, űrlap-validáció
- [ ] 👤 **Valódi social linkek** — footer/kapcsolat FB + IG URL (most `#`)
- [ ] 👤 **Krisztina feltölti a valódi ~30 ingatlant** (admin)
- [ ] Opcionális: kapcsolat-oldali fejléc-alcím már átírva (kész)

## F) Később / opcionális (Phase 4)

- [ ] Publikus felhasználói fiók (Supabase Auth) + mentett keresés
- [ ] Storage → Cloudflare R2, ha az 1 GB elfogy
