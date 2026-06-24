# Supabase beállítása — My Home Budapest

Ez az útmutató végigvezet a Supabase (adatbázis + képtárhely) létrehozásán.
Egyszeri, kb. **5–10 perc**, és **nincs szükség bankkártyára**.

> A fiók Krisztina e-mailjével készül, hogy hosszú távon az ügyfélé legyen az
> adat és a számlázás. Az alábbiakat végig lehet csinálni laptopon és mobilon is.

A végén négy adatra lesz szükség (ezeket kell visszaküldeni a fejlesztőnek):

1. **Project URL**
2. **anon public** kulcs
3. **service_role** kulcs
4. visszaigazolás, hogy a séma lefutott és a tárhely-bucket elkészült

---

## 1. Fiók létrehozása

1. Nyisd meg: **https://supabase.com** → jobb fent **Start your project** / **Sign up**.
2. Regisztrálj **Krisztina e-mailjével** (e-mail + jelszó, vagy Google/GitHub).
3. Erősítsd meg az e-mailt, ha kér ilyet.

> Kártyát **nem** kér. A „Free" csomag elég: 500 MB adatbázis, 1 GB képtárhely.

---

## 2. Új projekt létrehozása

1. Belépés után: **New project**.
2. Töltsd ki:
   - **Name:** `myhome-budapest`
   - **Database Password:** generálj egy erőset (a „Generate" gombbal), és
     **mentsd el** egy biztonságos helyre. (A napi működéshez nem kell, de jó, ha megvan.)
   - **Region:** **Central EU (Frankfurt)** — ez a legközelebbi, leggyorsabb Magyarországnak.
3. **Create new project**. A létrehozás 1–2 percig tart (amíg fut, mehetsz a 3. lépésre olvasni).

---

## 3. Az adatbázis-séma létrehozása

1. Bal oldali menü: **SQL Editor** → **New query**.
2. Nyisd meg a projekt `supabase/schema.sql` fájlját, **másold ki az egész tartalmát**,
   és illeszd be a szerkesztőbe.
3. Nyomd meg a **Run** gombot (jobb alul, vagy Ctrl/Cmd + Enter).
4. Sikeres, ha alul ezt látod: **Success. No rows returned**.

Ezzel létrejött a két tábla (`properties`, `inquiries`) és a biztonsági szabályok.

> Ellenőrzés (opcionális): bal menü **Table Editor** → ott kell lennie a
> `properties` és `inquiries` táblának.

---

## 4. Képtárhely (Storage bucket) létrehozása

1. Bal oldali menü: **Storage** → **New bucket**.
2. **Name:** `property-images` (pontosan így, kötőjellel).
3. Kapcsold **be**: **Public bucket** (a képeknek nyilvánosan elérhetőnek kell lenniük az oldalon).
4. **Create bucket**.

> Ide kerülnek majd a feltöltött (automatikusan WebP-re tömörített) ingatlanképek.

---

## 5. A kulcsok kimásolása

1. Bal oldali menü: **Project Settings** (fogaskerék) → **API**.
2. Másold ki és küldd el a fejlesztőnek:
   - **Project URL** (pl. `https://abcdxyz.supabase.co`)
   - **Project API keys → `anon` `public`** — ez biztonságos, mehet a böngészőbe
   - **Project API keys → `service_role` `secret`** — ⚠️ **TITKOS!**

> ⚠️ A **service_role** kulcs olyan, mint egy mesterkulcs: mindenhez hozzáfér.
> **Soha ne tedd ki nyilvánosan** (kód, GitHub, screenshot publikus helyen).
> Csak privát csatornán küldd el a fejlesztőnek. A szerveren tároljuk, a böngészőbe
> sosem kerül.

---

## 6. Kész — mit küldj vissza

- ✅ Project URL
- ✅ anon public kulcs
- ✅ service_role kulcs (privát csatornán)
- ✅ „A schema.sql lefutott, és a `property-images` bucket elkészült."

A fejlesztő ezután bekapcsolja a Supabase-t a `.env.local`-ban és a Vercelen, és
áthozza az adatokat + a képkezelést. Eddig az oldal a mostani (mock) adatokon fut
zavartalanul — semmi nem áll le a beállítás közben.
