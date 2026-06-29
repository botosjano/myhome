import { Mail, Phone } from 'lucide-react';

const CONTROLLER = 'My Home Ingatlan Iroda Budapest';
const EMAIL = 'myhome@olahkrisztina.hu';
const PHONE = '+36 30 941 4510';

/**
 * GDPR privacy policy — rendered by both /[locale]/adatkezeles (HU) and
 * /[locale]/privacy-policy (EN). Content is chosen by locale. Navy/gold design
 * matching the rest of the site.
 */
export default function PrivacyPolicy({ locale }: { locale: string }) {
  const hu = locale === 'hu';
  const s = hu ? HU : EN;

  return (
    <div className="bg-white pt-24">
      <div className="border-b border-navy/10 bg-cream">
        <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
          <p className="eyebrow mb-2">{s.eyebrow}</p>
          <h1 className="font-serif text-3xl text-navy sm:text-4xl">{s.title}</h1>
          <p className="mt-2 font-sans text-sm text-navy/55">{s.updated}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        {/* Data controller card */}
        <div className="mb-10 rounded-sm border border-navy/10 bg-cream p-6">
          <h2 className="font-serif text-lg text-navy">{s.controllerTitle}</h2>
          <p className="mt-2 font-sans text-sm font-medium text-navy">{CONTROLLER}</p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-2 flex items-center gap-2 font-sans text-sm text-navy/70 hover:text-gold"
          >
            <Mail className="h-4 w-4 text-gold" />
            {EMAIL}
          </a>
          <a
            href={`tel:${PHONE.replace(/\s/g, '')}`}
            className="mt-1 flex items-center gap-2 font-sans text-sm text-navy/70 hover:text-gold"
          >
            <Phone className="h-4 w-4 text-gold" />
            {PHONE}
          </a>
        </div>

        <div className="space-y-8">
          {s.sections.map((sec) => (
            <section key={sec.h}>
              <h2 className="mb-2 font-serif text-xl text-navy">{sec.h}</h2>
              {sec.p.map((para, i) => (
                <p key={i} className="mb-2 font-sans text-sm leading-relaxed text-navy/70">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

const HU = {
  eyebrow: 'Jogi tudnivalók',
  title: 'Adatkezelési tájékoztató',
  updated: 'Hatályos: 2026',
  controllerTitle: 'Az adatkezelő',
  sections: [
    {
      h: '1. Bevezetés',
      p: [
        'A jelen tájékoztató ismerteti, hogyan kezeli a My Home Ingatlan Iroda Budapest (a továbbiakban: Adatkezelő) a weboldal látogatóinak személyes adatait, az Európai Unió Általános Adatvédelmi Rendeletének (GDPR) megfelelően.',
      ],
    },
    {
      h: '2. Milyen adatokat kezelünk',
      p: [
        'Kapcsolatfelvételi és érdeklődési űrlapok kitöltésekor: név, e-mail cím, telefonszám, valamint az Ön által megadott üzenet és az érdeklődéssel kapcsolatos információk.',
        'A weboldal használata során automatikusan: a működéshez szükséges sütik (cookie-k) által tárolt technikai adatok.',
      ],
    },
    {
      h: '3. Az adatkezelés célja és jogalapja',
      p: [
        'Az adatokat kapcsolatfelvétel, az érdeklődések megválaszolása, valamint ingatlanközvetítési szolgáltatásunk nyújtása céljából kezeljük.',
        'Az adatkezelés jogalapja az Ön hozzájárulása (GDPR 6. cikk (1) a) pont), illetve a szolgáltatás teljesítéséhez fűződő jogos érdek.',
      ],
    },
    {
      h: '4. Sütik (cookie-k)',
      p: [
        'Weboldalunk sütiket használ a megfelelő működés és a jobb felhasználói élmény érdekében (pl. a nyelvi beállítás és a kedvencek megjegyzése). A sütik használatához az oldal alján megjelenő sávon adhat hozzájárulást.',
      ],
    },
    {
      h: '5. Adatfeldolgozók, adattovábbítás',
      p: [
        'Az érdeklődések kezeléséhez ügyfélkapcsolati (CRM) rendszert, a weboldal és a képek tárolásához tárhelyszolgáltatót veszünk igénybe. Ezek a szolgáltatók kizárólag a szolgáltatás nyújtásához szükséges mértékben, az Adatkezelő utasításai szerint férnek hozzá az adatokhoz. Harmadik fél részére marketing célból adatot nem adunk át.',
      ],
    },
    {
      h: '6. Az adatok megőrzése',
      p: [
        'A személyes adatokat csak a cél eléréséhez szükséges ideig, illetve az Ön hozzájárulásának visszavonásáig őrizzük meg.',
      ],
    },
    {
      h: '7. Az Ön jogai',
      p: [
        'Önt megilleti a tájékoztatáshoz, a hozzáféréshez, a helyesbítéshez, a törléshez („elfeledtetéshez"), az adatkezelés korlátozásához, az adathordozhatósághoz és a tiltakozáshoz való jog, valamint a hozzájárulás bármikori visszavonásának joga.',
        'Jogai gyakorlásához vagy bármilyen adatvédelmi kérdésével keressen minket a fenti elérhetőségeken. Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat.',
      ],
    },
  ],
};

const EN = {
  eyebrow: 'Legal',
  title: 'Privacy Policy',
  updated: 'Effective: 2026',
  controllerTitle: 'Data controller',
  sections: [
    {
      h: '1. Introduction',
      p: [
        'This policy explains how My Home Ingatlan Iroda Budapest (the “Data Controller”) processes the personal data of visitors to this website, in accordance with the EU General Data Protection Regulation (GDPR).',
      ],
    },
    {
      h: '2. What data we process',
      p: [
        'When you submit a contact or inquiry form: your name, email address, phone number, and the message and inquiry details you provide.',
        'When using the website automatically: technical data stored by the cookies required for the site to function.',
      ],
    },
    {
      h: '3. Purpose and legal basis',
      p: [
        'We process your data to respond to your inquiries, contact you, and provide our real estate brokerage services.',
        'The legal basis is your consent (Art. 6(1)(a) GDPR) and our legitimate interest in delivering the requested service.',
      ],
    },
    {
      h: '4. Cookies',
      p: [
        'Our website uses cookies for proper operation and a better experience (e.g. remembering your language and saved favourites). You can give your consent via the banner shown at the bottom of the page.',
      ],
    },
    {
      h: '5. Processors and data transfers',
      p: [
        'We use a customer relationship (CRM) system to handle inquiries and a hosting provider to store the website and images. These providers access data only to the extent necessary to provide the service and on the Controller’s instructions. We do not share data with third parties for marketing purposes.',
      ],
    },
    {
      h: '6. Data retention',
      p: [
        'We retain personal data only for as long as necessary to fulfil the purpose, or until you withdraw your consent.',
      ],
    },
    {
      h: '7. Your rights',
      p: [
        'You have the right to information, access, rectification, erasure (“to be forgotten”), restriction of processing, data portability and objection, as well as the right to withdraw your consent at any time.',
        'To exercise your rights or for any data protection question, contact us using the details above. You may also lodge a complaint with the competent supervisory authority (in Hungary, the NAIH).',
      ],
    },
  ],
};
