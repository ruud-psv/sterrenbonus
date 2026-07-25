export const metadata = { title: "PSV FANdag — Draaiboek" };

const HTML = `<style>

  :root {
    --red:#e82026; --red-deep:#b8161b; --ink:#12100f; --paper:#ffffff;
    --card:rgba(18,14,15,.90); --card-line:rgba(255,255,255,.12);
    --text:#ffffff; --muted:#e6c9cb; --faint:#c99ea1;
    --gold:#ffd23f;
  }
  * { box-sizing:border-box; }
  html { -webkit-text-size-adjust:100%; }
  body { margin:0; color:var(--text); background:var(--red);
    font-family:"PSVText","Helvetica Neue",Helvetica,Arial,system-ui,sans-serif;
    font-size:17px; line-height:1.6; -webkit-font-smoothing:antialiased; overflow-x:hidden; }

  /* Fixed PSV-pattern backdrop (works on iOS, unlike background-attachment:fixed) */
  .bg { position:fixed; inset:0; z-index:-2;
    background:#e82026 url('/fandag-bg.jpg') center 25%/cover no-repeat; }
  .bg::after { content:""; position:absolute; inset:0;
    background:radial-gradient(120% 90% at 50% 0%, rgba(0,0,0,.18), rgba(0,0,0,.42)); }

  .wrap { max-width:760px; margin:0 auto; padding:22px 16px 72px; }

  header.hero { text-align:center; padding:8px 0 4px; }
  .logo { width:min(300px,72vw); height:auto; display:inline-block;
    filter:drop-shadow(0 8px 22px rgba(0,0,0,.28)); }
  .kicker { margin-top:16px; font-family:"PSVBranding","Helvetica Neue",sans-serif;
    font-style:italic; text-transform:uppercase; letter-spacing:.04em; font-size:1.5rem;
    color:#fff; text-shadow:0 2px 10px rgba(0,0,0,.35); }
  .sub { color:#fff; opacity:.95; margin:.3em auto 0; max-width:34ch; font-size:1rem; text-shadow:0 1px 6px rgba(0,0,0,.3); }

  .chips { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:18px 0 6px; }
  .chip { display:inline-flex; align-items:center; gap:6px; background:rgba(0,0,0,.34);
    border:1px solid rgba(255,255,255,.28); color:#fff; border-radius:999px;
    padding:7px 13px; font-size:.9rem; font-weight:600; backdrop-filter:blur(2px); }
  .chip b { font-weight:800; }

  section { margin-top:20px; }
  .card { background:var(--card); border:1px solid var(--card-line); border-radius:18px;
    padding:20px 18px; box-shadow:0 10px 30px rgba(0,0,0,.28); }
  section + section .card { }

  h2 { font-family:"PSVBranding","Helvetica Neue",sans-serif; font-style:italic; font-weight:700;
    text-transform:uppercase; letter-spacing:.02em; font-size:1.5rem; line-height:1.05;
    margin:0 0 14px; color:#fff; }
  h2 .bar { display:block; width:44px; height:4px; background:var(--red); border-radius:3px; margin-top:8px; }
  h3 { font-size:1.02rem; font-weight:800; margin:18px 0 6px; color:#fff; }
  p { margin:.55em 0; }
  .muted { color:var(--muted); }
  .small { font-size:.86rem; }
  em { font-style:italic; color:#fff; }

  /* Link cards — white with red text, like the START button */
  .links { display:grid; gap:11px; }
  .link { display:block; text-decoration:none; background:#fff; color:var(--red);
    border-radius:14px; padding:15px 16px; box-shadow:0 6px 18px rgba(0,0,0,.22);
    border:2px solid transparent; transition:transform .12s, border-color .12s; }
  .link:active { transform:scale(.99); }
  .link .role { font-size:.7rem; letter-spacing:.13em; text-transform:uppercase; font-weight:800; color:var(--red); opacity:.75; }
  .link .name { font-weight:800; font-size:1.05rem; margin-top:1px; color:var(--ink); }
  .link .url { font-size:.82rem; color:var(--red); word-break:break-all; margin-top:3px; font-weight:600; }

  ul.clean { margin:.5em 0; padding-left:1.15em; }
  ul.clean li { margin:.5em 0; }
  ul.clean li::marker { color:var(--red); }
  b { color:#fff; }
  .card .muted b, .card .small b { color:var(--muted); }

  .callout { background:rgba(232,32,38,.16); border:1px solid rgba(232,32,38,.6);
    border-radius:14px; padding:14px 16px; margin-top:14px; }

  /* Tables */
  .twrap { overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:14px;
    border:1px solid var(--card-line); margin-top:6px; }
  table { border-collapse:collapse; width:100%; font-size:.92rem; }
  th, td { padding:11px 13px; text-align:left; border-bottom:1px solid rgba(255,255,255,.09); white-space:nowrap; }
  thead th { background:var(--red); color:#fff; font-size:.72rem; letter-spacing:.06em;
    text-transform:uppercase; font-weight:800; position:sticky; top:0; }
  td { color:#fff; }
  tbody tr:nth-child(even) td { background:rgba(255,255,255,.03); }
  tbody tr:last-child td { border-bottom:none; }
  td.num, th.num { text-align:right; font-variant-numeric:tabular-nums; }
  .time { font-variant-numeric:tabular-nums; font-weight:800; }
  tr.total td { font-weight:800; background:rgba(232,32,38,.22); border-top:2px solid var(--red); }
  tr.marquee td { background:rgba(255,210,63,.14); }
  tr.marquee .time { color:var(--gold); }
  .prize-cell { white-space:normal; }

  .tag { display:inline-block; font-size:.68rem; font-weight:800; letter-spacing:.04em;
    text-transform:uppercase; padding:3px 9px; border-radius:999px; }
  .tag.massa { background:var(--red); color:#fff; }
  .tag.midden { background:rgba(255,255,255,.16); color:#fff; border:1px solid rgba(255,255,255,.35); }
  .tag.premie { background:var(--gold); color:#4a3600; }

  ol.steps { counter-reset:step; list-style:none; margin:8px 0 0; padding:0; }
  ol.steps li { position:relative; padding:10px 0 10px 46px; border-bottom:1px solid rgba(255,255,255,.1); }
  ol.steps li:last-child { border-bottom:none; }
  ol.steps li::before { counter-increment:step; content:counter(step); position:absolute; left:0; top:9px;
    width:30px; height:30px; border-radius:50%; background:var(--red); color:#fff;
    display:flex; align-items:center; justify-content:center; font-weight:800; font-size:.9rem; }

  footer { margin-top:26px; text-align:center; color:#fff; opacity:.9; font-size:.82rem;
    text-shadow:0 1px 6px rgba(0,0,0,.3); }

  @media (min-width:560px) {
    body { font-size:18px; }
    .wrap { padding:34px 22px 80px; }
    .kicker { font-size:1.9rem; }
    .links { grid-template-columns:1fr 1fr; }
    h2 { font-size:1.8rem; }
    .card { padding:26px 26px; }
  }
</style>

<div class="bg"></div>
<div class="wrap">

  <header class="hero">
    <img class="logo" src="/fandag-logo.png" alt="PSV FANdag" />
    <div class="kicker">Prijzentrekking</div>
    <p class="sub">Draaiboek voor de crew — hoe het werkt, wanneer welke prijs valt, en alle links.</p>
    <div class="chips">
      <span class="chip">📅 <b>Za 25 juli</b></span>
      <span class="chip">🕛 <b>12:00–18:00</b></span>
      <span class="chip">🎡 <b>2 kiosks</b></span>
      <span class="chip">🎁 <b>3.611</b> prijzen</span>
    </div>
  </header>

  <section><div class="card">
    <h2>Links<span class="bar"></span></h2>
    <div class="links">
      <a class="link" href="https://sterrenbonus.vercel.app/?theme=fanscan">
        <div class="role">Trekking · op de dag</div>
        <div class="name">FANdag-rad (kiosk)</div>
        <div class="url">sterrenbonus.vercel.app/?theme=fanscan</div>
      </a>
      <a class="link" href="https://sterrenbonus.vercel.app/admin?theme=fanscan">
        <div class="role">Beheer</div>
        <div class="name">Prijzen &amp; voorraad</div>
        <div class="url">sterrenbonus.vercel.app/admin?theme=fanscan</div>
      </a>
      <a class="link" href="https://sterrenbonus.vercel.app/?theme=fanscantest">
        <div class="role">Oefenen · vooraf</div>
        <div class="name">Testrad</div>
        <div class="url">sterrenbonus.vercel.app/?theme=fanscantest</div>
      </a>
      <a class="link" href="https://sterrenbonus.vercel.app/admin?theme=fanscantest">
        <div class="role">Beheer · test</div>
        <div class="name">Testbeheer</div>
        <div class="url">sterrenbonus.vercel.app/admin?theme=fanscantest</div>
      </a>
    </div>
    <p class="small muted" style="margin-top:12px">De <b>test</b>-link wint meteen en raakt de echte voorraad niet — ideaal om vooraf te oefenen. De echte <b>trekking</b> geeft vóór 25 juli 12:00 bewust alleen "helaas" en gaat om 12:00 vanzelf aan.</p>
  </div></section>

  <section><div class="card">
    <h2>Hoe het werkt<span class="bar"></span></h2>
    <p>Fans draaien aan het rad op een van de kiosks. Elke draai geeft óf een prijs, óf <em>"helaas, volgende keer beter"</em>. Zo blijft het spannend en zijn er de hele dag prijzen te winnen.</p>

    <h3>Drie soorten prijzen</h3>
    <ul class="clean">
      <li><span class="tag massa">Veelvoorkomend</span> — stressbal, plaktattoo, gloeilampje, strandbal. Wint verreweg de meeste mensen.</li>
      <li><span class="tag midden">Midden</span> — o.a. gymtas, museum, giftcard, membership, stadiontour. Af en toe.</li>
      <li><span class="tag premie">Top</span> — gesigneerde shirts, tickets, spelersbus, training, Meet &amp; Greet. Zeldzaam en op vaste momenten.</li>
    </ul>

    <h3>Hoe vaak valt wat?</h3>
    <p>De kans hangt af van de voorraad: veel voorraad = grote kans, zeldzaam = kleine kans. De meeste fans winnen dus iets kleins, en af en toe valt er iets moois.</p>

    <h3>Wanneer valt wat?</h3>
    <ul class="clean">
      <li><b>Gewone prijzen</b> worden gelijkmatig over de dag verdeeld, zodat het niet 's ochtends al op is. Is het druk, dan valt er tussendoor vaker "helaas" om de voorraad te rekken.</li>
      <li><b>Topprijzen</b> vallen op vaste momenten (zie schema), met de mooiste in de piek 14:00–16:00. Ze gaan gegarandeerd allemaal weg vóór 18:00.</li>
    </ul>

    <div class="callout">
      <b>Betrouwbaar &amp; eerlijk.</b> De voorraad telt automatisch af; is een prijs op, dan verdwijnt 'ie uit het rad. Elke prijs — ook een uniek gesigneerd shirt — kan <b>nooit vaker vallen dan er zijn</b>, ook niet als beide kiosks exact tegelijk draaien.
    </div>
  </div></section>

  <section><div class="card">
    <h2>Premies — tijdschema<span class="bar"></span></h2>
    <p class="muted small">De 21 topprijzen vallen op vaste momenten, naar de <b>eerstvolgende draai vanaf dat tijdstip</b>. <span style="color:var(--gold)">★</span> = publiekstrekkers in de piek — mooi om aan te kondigen.</p>
    <div class="twrap"><table>
      <thead><tr><th>Tijd</th><th>Prijs</th></tr></thead>
      <tbody>
        <tr><td class="time">12:20</td><td class="prize-cell">Meet &amp; Greet met Phoxy</td></tr>
        <tr><td class="time">12:45</td><td class="prize-cell">Wedstrijdexperience Lichtstadderby</td></tr>
        <tr><td class="time">13:10</td><td class="prize-cell">Twee tickets PSV – Villarreal CF</td></tr>
        <tr class="marquee"><td class="time">14:05 ★</td><td class="prize-cell">Gesigneerd shirt Sven Mijnans</td></tr>
        <tr class="marquee"><td class="time">14:15 ★</td><td class="prize-cell">Twee tickets PSV – Feyenoord</td></tr>
        <tr class="marquee"><td class="time">14:25 ★</td><td class="prize-cell">Twee tickets Johan Cruijff Schaal</td></tr>
        <tr><td class="time">14:35</td><td class="prize-cell">Twee tickets Lichtstadderby</td></tr>
        <tr><td class="time">14:45</td><td class="prize-cell">Twee tickets PSV – Villarreal CF</td></tr>
        <tr><td class="time">14:55</td><td class="prize-cell">PSV Spelersbus naar je uitwedstrijd</td></tr>
        <tr class="marquee"><td class="time">15:05 ★</td><td class="prize-cell">Gesigneerd shirt Mauro Júnior</td></tr>
        <tr class="marquee"><td class="time">15:15 ★</td><td class="prize-cell">Gesigneerd shirt Ruben van Bommel</td></tr>
        <tr><td class="time">15:25</td><td class="prize-cell">Twee tickets Lichtstadderby</td></tr>
        <tr><td class="time">15:35</td><td class="prize-cell">Wedstrijdexperience Lichtstadderby</td></tr>
        <tr><td class="time">15:45</td><td class="prize-cell">Meet &amp; Greet met Phoxy</td></tr>
        <tr><td class="time">15:55</td><td class="prize-cell">Twee tickets PSV – Villarreal CF</td></tr>
        <tr><td class="time">16:10</td><td class="prize-cell">Twee tickets Lichtstadderby</td></tr>
        <tr><td class="time">16:25</td><td class="prize-cell">Twee personen een besloten training bezoeken</td></tr>
        <tr><td class="time">16:40</td><td class="prize-cell">Exclusieve rondleiding profzijde</td></tr>
        <tr><td class="time">16:55</td><td class="prize-cell">Thuisshirt</td></tr>
        <tr><td class="time">17:15</td><td class="prize-cell">Uitshirt</td></tr>
        <tr><td class="time">17:40</td><td class="prize-cell">Derde shirt</td></tr>
      </tbody>
    </table></div>
  </div></section>

  <section><div class="card">
    <h2>Verdeling per uur<span class="bar"></span></h2>
    <p class="muted small">Indicatie uit een simulatie van een rustige dag (~2.500 draaien). Gewone prijzen komen willekeurig per draai — dit zijn verwachte aantallen, geen vaste tijden.</p>
    <div class="twrap"><table>
      <thead><tr><th>Tijdvak</th><th class="num">Draaien</th><th class="num">Massa</th><th class="num">Midden</th><th class="num">Premies</th><th class="num">Helaas</th></tr></thead>
      <tbody>
        <tr><td class="time">12–13</td><td class="num">261</td><td class="num">240</td><td class="num">19</td><td class="num">2</td><td class="num">0</td></tr>
        <tr><td class="time">13–14</td><td class="num">373</td><td class="num">349</td><td class="num">23</td><td class="num">1</td><td class="num">0</td></tr>
        <tr><td class="time">14–15</td><td class="num">597</td><td class="num">548</td><td class="num">43</td><td class="num">6</td><td class="num">0</td></tr>
        <tr><td class="time">15–16</td><td class="num">597</td><td class="num">542</td><td class="num">49</td><td class="num">6</td><td class="num">0</td></tr>
        <tr><td class="time">16–17</td><td class="num">410</td><td class="num">382</td><td class="num">24</td><td class="num">4</td><td class="num">0</td></tr>
        <tr><td class="time">17–18</td><td class="num">261</td><td class="num">247</td><td class="num">12</td><td class="num">2</td><td class="num">0</td></tr>
        <tr class="total"><td>Totaal</td><td class="num">2.499</td><td class="num">2.308</td><td class="num">170</td><td class="num">21</td><td class="num">0</td></tr>
      </tbody>
    </table></div>
    <p class="small muted" style="margin-top:12px">Bij een <b>drukke</b> dag (~4.000 draaien) springt "helaas" juist aan in de piek om de voorraad te rekken — dan wordt bijna alles uitgedeeld. In beide gevallen vallen alle 21 premies.</p>
  </div></section>

  <section><div class="card">
    <h2>Alle prijzen<span class="bar"></span></h2>
    <div class="twrap"><table>
      <thead><tr><th>Prijs</th><th>Categorie</th><th class="num">Aantal</th></tr></thead>
      <tbody>
        <tr><td class="prize-cell">Phoxy Stressbal</td><td><span class="tag massa">Veel</span></td><td class="num">1.550</td></tr>
        <tr><td class="prize-cell">PSV Plaktattoo</td><td><span class="tag massa">Veel</span></td><td class="num">1.000</td></tr>
        <tr><td class="prize-cell">Phoxy Gloeilampje</td><td><span class="tag massa">Veel</span></td><td class="num">500</td></tr>
        <tr><td class="prize-cell">PSV Strandbal</td><td><span class="tag massa">Veel</span></td><td class="num">300</td></tr>
        <tr><td class="prize-cell">PSV Museum (2 pers.)</td><td><span class="tag midden">Midden</span></td><td class="num">100</td></tr>
        <tr><td class="prize-cell">Puma Gymtas</td><td><span class="tag midden">Midden</span></td><td class="num">60</td></tr>
        <tr><td class="prize-cell">FANstore Giftcard €5</td><td><span class="tag midden">Midden</span></td><td class="num">50</td></tr>
        <tr><td class="prize-cell">Jaar gratis Membership</td><td><span class="tag midden">Midden</span></td><td class="num">10</td></tr>
        <tr><td class="prize-cell">PSV Stadiontour (2 pers.)</td><td><span class="tag midden">Midden</span></td><td class="num">10</td></tr>
        <tr><td class="prize-cell">PSV Goodie</td><td><span class="tag midden">Midden</span></td><td class="num">10</td></tr>
        <tr><td class="prize-cell">Tickets Villarreal CF (2×)</td><td><span class="tag premie">Top</span></td><td class="num">3</td></tr>
        <tr><td class="prize-cell">Tickets Lichtstadderby (2×)</td><td><span class="tag premie">Top</span></td><td class="num">3</td></tr>
        <tr><td class="prize-cell">Wedstrijdexperience derby</td><td><span class="tag premie">Top</span></td><td class="num">2</td></tr>
        <tr><td class="prize-cell">Meet &amp; Greet met Phoxy</td><td><span class="tag premie">Top</span></td><td class="num">2</td></tr>
        <tr><td class="prize-cell">Gesigneerd shirt Sven Mijnans</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Gesigneerd shirt Mauro Júnior</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Gesigneerd shirt Ruben van Bommel</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Thuisshirt</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Uitshirt</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Derde shirt</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Tickets Johan Cruijff Schaal (2×)</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Tickets PSV – Feyenoord (2×)</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Spelersbus naar uitwedstrijd</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Besloten training (2 pers.)</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr><td class="prize-cell">Rondleiding profzijde</td><td><span class="tag premie">Top</span></td><td class="num">1</td></tr>
        <tr class="total"><td>Totaal</td><td></td><td class="num">3.611</td></tr>
      </tbody>
    </table></div>
  </div></section>

  <section><div class="card">
    <h2>Op de dag — bij de kiosk<span class="bar"></span></h2>
    <ol class="steps">
      <li>Fan drukt op <b>START</b> — het rad draait en landt op een prijs of "helaas".</li>
      <li>Prijs tonen/overhandigen. Bij een topprijs: mooi moment om te vieren 🎉.</li>
      <li>Druk op <b>"Nog een keer"</b> om direct de volgende fan te bedienen.</li>
    </ol>
    <p class="small muted" style="margin-top:12px">Voorraad checken of bijstellen kan via het <b>beheer</b> (zie links). Werkt een kiosk even niet? De andere draait door; ververs anders de pagina.</p>
  </div></section>

  <section><div class="card">
    <h2>Goed om te weten<span class="bar"></span></h2>
    <ul class="clean">
      <li>De trekking gaat <b>automatisch aan om 12:00</b>. Ervoor alleen "helaas" (er wordt niets verbruikt) — vooraf testen kan veilig via de test-link.</li>
      <li>Met 2 kiosks passen er realistisch <b>~2.000–4.000 draaien</b> in de dag. Bij rustig tempo blijft een deel van de <b>massaprijzen</b> over — met de hand uitdelen of bewaren.</li>
      <li>Topprijzen zijn <b>gegarandeerd</b>: zolang er na hun tijdstip nog gedraaid wordt, vallen ze allemaal.</li>
      <li>Alle aantallen kunnen tot de dag zelf worden aangepast in het beheer.</li>
    </ul>
  </div></section>

  <footer>PSV FANdag · prijzentrekking — aantallen conform "PSV FANdag – DEF prijzen"</footer>

</div>
`;

export default function HandleidingPage() {
  return <main dangerouslySetInnerHTML={{ __html: HTML }} />;
}
