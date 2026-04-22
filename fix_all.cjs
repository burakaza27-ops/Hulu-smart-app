const fs = require('fs');

// Real Oromoo and Tigrinya translations for key UI strings
const realTranslations = {
  'nav.dashboard': { om: 'Gabatee', ti: 'ዳሽቦርድ' },
  'nav.vault': { om: 'Kuusaa', ti: 'ካዝና' },
  'nav.legal': { om: 'Seeraa AI', ti: 'ሕጊ AI' },
  'nav.diaspora': { om: 'Biyyaa Alaa', ti: 'ዲያስፖራ' },
  'nav.inherit': { om: 'Dhaalaa', ti: 'ውርሻ' },
  'nav.more': { om: 'Dabalataa', ti: 'ተወሳኺ' },
  'dash.greeting.morning': { om: 'Akkam bulte', ti: 'ከመይ ሓዲርካ' },
  'dash.greeting.afternoon': { om: 'Akkam oolte', ti: 'ከመይ ውዒልካ' },
  'dash.greeting.evening': { om: 'Galgala gaarii', ti: 'ከመይ ኣምሲኻ' },
  'dash.welcome': { om: 'Baga nagaan dhufte, Kabaadaa', ti: 'እንቋዕ ደሓን መጻእካ፡ ከበደ' },
  'dash.totalBalance': { om: 'Balansi Waliigalaa', ti: 'ጠቕላላ ተረፍ' },
  'dash.quickActions': { om: 'Tarkaanfii Ariifataa', ti: 'ቅልጡፍ ተግባራት' },
  'dash.send': { om: 'Ergi', ti: 'ስደድ' },
  'dash.bills': { om: 'Bilbila', ti: 'ክፍሊት' },
  'dash.scan': { om: 'Iskaan', ti: 'ስካን' },
  'dash.topup': { om: 'Guuti', ti: 'ምልኣእ' },
  'dash.services': { om: 'Tajaajila HULU', ti: 'ኣገልግሎት HULU' },
  'dash.recentActivity': { om: 'Sochii Dhiyoo', ti: 'ናይ ቀረባ ንጥፈታት' },
  'dash.seeAll': { om: 'Hunda Ilaali', ti: 'ኩሉ ርአ' },
  'dash.virtualVault': { om: 'Kuusaa Dijitaalaa', ti: 'ዲጂታል ካዝና' },
  'dash.vaultDesc': { om: 'Dokumantiikee tiksi', ti: 'ሰነዳትካ ኣውሕስ' },
  'dash.aiLegal': { om: 'AI Seeraa', ti: 'AI ሕጊ' },
  'dash.legalDesc': { om: 'Waliigaltee battalumaan', ti: 'ውዕላት ብቕጽበት' },
  'dash.diasporaHub': { om: 'Giddugala Biyyaa Alaa', ti: 'ማእከል ዲያስፖራ' },
  'dash.diasporaDesc': { om: 'Biyyaa alaatii too\'adhu', ti: 'ካብ ወጻኢ ኣመሓድር' },
  'vault.title': { om: 'Kuusaa Dijitaalaa', ti: 'ዲጂታል ካዝና' },
  'vault.subtitle': { om: 'Ikkriptii sadarkaa loltummaa', ti: 'ናይ ወተሃደራዊ ደረጃ ምስጢራውነት' },
  'vault.locked': { om: 'Kuusaan cufaadha', ti: 'ካዝና ተዓጽያ ኣላ' },
  'vault.authPrompt': { om: 'Dokumantiikee argachuuf eenyummaa kee mirkaneessi', ti: 'ሰነዳትካ ንምርካብ መንነትካ ኣረጋግጽ' },
  'vault.authBtn': { om: 'Baayoomeetriksiin mirkaneessi', ti: 'ብባዮሜትሪክ ኣረጋግጽ' },
  'vault.documents': { om: 'Dokumantiiwwan', ti: 'ሰነዳት' },
  'vault.verified': { om: 'Mirkanaa\'e', ti: 'ተረጋጊጹ' },
  'vault.encryption': { om: 'Ikkriptii', ti: 'ምስጢራውነት' },
  'vault.search': { om: 'Dokumantiiwwan barbaadi...', ti: 'ሰነዳት ድለ...' },
  'vault.upload': { om: 'Dokumantii Haaraa Fe\'i', ti: 'ሓድሽ ሰነድ ጽዓን' },
  'legal.title': { om: 'Gargaaraa Seeraa AI', ti: 'ናይ AI ሕጊ ረዳኢ' },
  'legal.subtitle': { om: 'Qophii waliigaltee ogummaa', ti: 'ጥበባዊ ምድላው ውዕል' },
  'legal.greeting': { om: 'Nagaa! Ani gargaaraa seeraa AI keessani. Har\'a akkamiin isin gargaaruu?', ti: 'ሰላም! ኣነ ናይ AI ሕጊ ሓጋዚኻ እየ። ሎሚ ብኸመይ ክሕግዘካ?' },
  'legal.signDigitally': { om: 'Diijiitaalaan mallatteessi', ti: 'ብዲጂታል ፈርም' },
  'legal.saveToVault': { om: 'Kuusaatti olkaa\'i', ti: 'ናብ ካዝና ዓቅብ' },
  'legal.inputPlaceholder': { om: 'Waliigaltee barbaaddu ibsi...', ti: 'ዘደሊኻ ውዕል ግለጽ...' },
  'bills.title': { om: 'Bilbila Kafali', ti: 'ክፍሊት ፈጽም' },
  'bills.confirmPayment': { om: 'Kaffaltii Mirkaneessi', ti: 'ክፍሊት ኣረጋግጽ' },
  'bills.success': { om: 'Kaffaltiin milkaa\'e!', ti: 'ክፍሊት ተዓዊቱ!' },
  'send.title': { om: 'Maallaqa Ergi', ti: 'ገንዘብ ስደድ' },
  'send.success': { om: 'Dabarsiin milkaa\'e!', ti: 'ምስግጋር ተዓዊቱ!' },
  'profile.title': { om: 'Piroofaayilii fi Qindaa\'ina', ti: 'ፕሮፋይልን ቅጥዒታትን' },
  'profile.language': { om: 'Afaan', ti: 'ቋንቋ' },
  'profile.signOut': { om: 'Ba\'i', ti: 'ውጻእ' },
  'bio.title': { om: 'Mirkaneessa Baayoomeetriksii', ti: 'ባዮሜትሪክ ምርግጋጽ' },
  'bio.verified': { om: 'Eenyummaan mirkanaa\'e', ti: 'መንነት ተረጋጊጹ' },
  'bio.cancel': { om: 'Haquu', ti: 'ሰርዝ' },
  'splash.skip': { om: 'Irra darbi', ti: 'ዝለል' },
  'splash.next': { om: 'Itti aanee', ti: 'ዝቕጽል' },
  'splash.getStarted': { om: 'Jalqabi', ti: 'ጀምር' },
  'topup.title': { om: 'Guuti', ti: 'ምልኣእ' },
  'topup.success': { om: 'Guutuun milkaa\'e!', ti: 'ምምላእ ተዓዊቱ!' },
  'diaspora.title': { om: 'Giddugala Biyyaa Alaa', ti: 'ማእከል ዲያስፖራ' },
  'diaspora.subtitle': { om: 'Itoophiyaa bakka hundaa irraa too\'adhu', ti: 'ኢትዮጵያ ካብ ዝኾነ ቦታ ኣመሓድር' },
  'inherit.title': { om: 'Dhaalaa Diijiitaalaa', ti: 'ዲጂታል ውርሻ' },
  'inherit.subtitle': { om: 'Karoora dhaalaa ogummaa', ti: 'ጥበባዊ መደብ ውርሻ' },
  'app.name': { om: 'HULU', ti: 'ሁሉ' },
  'app.tagline': { om: 'WIIRTUU TAJAAJILAA OGUMMAA', ti: 'ዘመናዊ ማእከል ኣገልግሎት' },
};

let file = fs.readFileSync('d:/hulu/src/i18n/translations.js', 'utf8');

for (const [key, vals] of Object.entries(realTranslations)) {
  // Find the key entry and replace om/ti values
  const escapedKey = key.replace(/\./g, '\\.');
  
  if (vals.om) {
    // Replace om value for this key
    const omRegex = new RegExp(`('${escapedKey}':\\s*\\{[^}]*om:\\s*)'[^']*'`, 's');
    file = file.replace(omRegex, `$1'${vals.om}'`);
  }
  if (vals.ti) {
    const tiRegex = new RegExp(`('${escapedKey}':\\s*\\{[^}]*ti:\\s*)'[^']*'`, 's');
    file = file.replace(tiRegex, `$1'${vals.ti}'`);
  }
}

// Fix the comment at top
file = file.replace('// HULU i18n — Amharic / English translation dictionary', '// HULU i18n — English / Amharic / Afaan Oromoo / Tigrinya translation dictionary');

fs.writeFileSync('d:/hulu/src/i18n/translations.js', file);
console.log('✅ Real translations applied for', Object.keys(realTranslations).length, 'keys');
