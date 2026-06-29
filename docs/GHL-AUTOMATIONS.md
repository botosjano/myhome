# GHL pipeline automatizálások — terv (My Home Budapest)

Ezek **GoHighLevel Workflow**-k, a 4 pipeline stage-eihez kötve. Nem kódfüggők —
a GHL felületén épülnek fel. Ez a dokumentum a tervet + a kész magyar
email-szövegeket tartalmazza.

**Döntések (2026-06):** csak **email** most (SMS később); a GHL email-küldést a
megrendelő állítja be; **Google review** linkje még nincs → a „won" emailbe
később kerül be (helykitöltő jelölve).

## ELŐFELTÉTEL — GHL email-küldés beállítása

Mielőtt bármelyik workflow élesedne, a GHL-ben kell egy **hitelesített küldő
domain/cím** (pl. `noreply@olahkrisztina.hu` vagy `iroda@…`), különben az emailek
spam-be esnek. GHL: Settings → Email Services → Dedicated Domain / DKIM-SPF
rekordok beállítása a domain DNS-ében. (Ezt a megrendelő intézi.)

A pipeline-ok stage-ei (referencia):

| Pipeline | Stage-ek |
|---|---|
| **Vevők** | Új érdeklődő → Kapcsolatfelvétel → Megtekintés → Ajánlat alatt → Megvásárolta → Elveszett |
| **Bérlők** | Új érdeklődő → Kapcsolatfelvétel → Megtekintés → Tárgyalás → Kibérelte → Elveszett |
| **Eladók** | Új lead → Kapcsolatfelvétel → Helyszíni szemle → Aktív megbízás → Eladva → Elveszett |
| **Bérbeadók** | Új lead → Kapcsolatfelvétel → Helyszíni szemle → Aktív megbízás → Kiadva → Elveszett |

Két „sáv": **érdeklődő-sáv** (Vevők+Bérlők) és **megbízó-sáv** (Eladók+Bérbeadók).

---

## 1) Új lead — azonnali fogadás

**Trigger:** Opportunity Created (mind a 4 pipeline első stage-ében: Új érdeklődő / Új lead).
**Akciók:**
1. **Email az ügyfélnek** (sáv szerinti szöveg — lásd lent).
2. **Belső értesítő email** Krisztinának (az új lead adataival).
3. **Feladat (Task):** „Hívd vissza – {{contact.name}}", határidő +2 óra.

### Email — érdeklődő-sáv (Vevők/Bérlők)
**Tárgy:** Köszönjük megkeresését – My Home Budapest
```
Kedves {{contact.first_name}}!

Köszönjük, hogy a My Home Budapestet választotta. Megkeresését megkaptuk,
és munkatársunk hamarosan, legkésőbb 24 órán belül felveszi Önnel a kapcsolatot.

Ha sürgős, hívjon minket bizalommal: +36 30 941 4510.

Üdvözlettel,
Oláh Krisztina
My Home Budapest
+36 30 941 4510 · myhome@olahkrisztina.hu
```

### Email — megbízó-sáv (Eladók/Bérbeadók)
**Tárgy:** Köszönjük megkeresését – My Home Budapest
```
Kedves {{contact.first_name}}!

Köszönjük, hogy ingatlana értékesítését/bérbeadását a My Home Budapestre bízná.
Megkeresését megkaptuk, és hamarosan, legkésőbb 24 órán belül felvesszük Önnel
a kapcsolatot a részletek egyeztetéséhez.

Üdvözlettel,
Oláh Krisztina
My Home Budapest
+36 30 941 4510 · myhome@olahkrisztina.hu
```

### Belső értesítő — Krisztinának
**Tárgy:** 🔔 Új lead: {{opportunity.name}}
```
Új érdeklődő érkezett a weboldalról.

Név:      {{contact.name}}
Telefon:  {{contact.phone}}
Email:    {{contact.email}}
Pipeline: {{opportunity.pipeline_name}}
Üzenet:   (lásd az opportunity „Üzenet" mezőjét)

Nyisd meg a CRM-ben: {{opportunity.url}}
```

---

## 2) Follow-up emlékeztető (nincs előrelépés)

**Trigger:** Opportunity „Kapcsolatfelvétel" stage-ben **48 órája** (Wait + If/Else: ha még itt van).
**Akció:** Belső **feladat/emlékeztető** Krisztinának: „Lépj kapcsolatba – {{contact.name}}".
(Ügyfélnek ekkor nem megy email.)

---

## 3) Megtekintés / helyszíni szemle emlékeztető

**Trigger:** időpont rögzítve (GHL Appointment), **vagy** stage = Megtekintés / Helyszíni szemle.
**Akció:** **Emlékeztető email** az ügyfélnek az időpont előtt (pl. 1 nappal).

**Tárgy:** Emlékeztető – egyeztetett időpontunk
```
Kedves {{contact.first_name}}!

Emlékeztetjük a velünk egyeztetett időpontra. Ha bármi közbejön vagy módosítana,
kérjük jelezze a +36 30 941 4510 számon.

Várjuk szeretettel!
My Home Budapest
```
> Megjegyzés: a pontos időpont-mezők attól függnek, GHL Calendar-időpontként vagy
> kézzel kezelitek-e a megtekintéseket. Ha Calendar, a beépített Appointment
> reminder workflow a legtisztább.

---

## 4) Sikeres üzlet — köszönet (+ Google review később)

**Trigger:** stage = Megvásárolta / Kibérelte / Eladva / Kiadva.
**Akciók:**
1. **Köszönő email** azonnal.
2. **(Később)** Google értékelés-kérő email +3-5 nappal — a review-link megérkezésekor.

### Email — köszönet (érdeklődő-sáv, vevő/bérlő)
**Tárgy:** Gratulálunk és köszönjük a bizalmat!
```
Kedves {{contact.first_name}}!

Gratulálunk, és köszönjük, hogy minket választott! Öröm volt segíteni az új
otthona megtalálásában. Ha a jövőben bármiben segíthetünk, keressen bizalommal.

Üdvözlettel,
Oláh Krisztina
My Home Budapest

[KÉSŐBB: „Ha elégedett volt, hálásak lennénk egy rövid Google értékelésért: <REVIEW_LINK>"]
```

### Email — köszönet (megbízó-sáv, eladó/bérbeadó)
**Tárgy:** Köszönjük a bizalmat!
```
Kedves {{contact.first_name}}!

Köszönjük, hogy ránk bízta ingatlana értékesítését/bérbeadását, és gratulálunk
a sikeres üzlethez! Bármikor állunk rendelkezésére a jövőben is.

Üdvözlettel,
Oláh Krisztina
My Home Budapest

[KÉSŐBB: Google értékelés-kérő link]
```

---

## 5) Elveszett lead (opcionális)

**Trigger:** stage = Elveszett.
**Akció (opcionális):** udvarias „máskor szívesen" email, vagy semmi.
```
Kedves {{contact.first_name}}!

Köszönjük érdeklődését. Ha a jövőben mégis segíthetünk ingatlanügyben,
keressen minket bizalommal.

Üdvözlettel, My Home Budapest
```

---

## Később hozzáadandó

- **Google review link** → a 4. pont „won" emailjeibe (+ külön review-kérő email +3-5 nappal).
- **SMS** a kulcspontokon (új lead visszaigazolás, megtekintés-emlékeztető) — GHL-szám beállítása után.
- **Megtekintés-időpontok** GHL Calendarrel → beépített appointment reminderek (email+SMS).
