// ===== iLogix storyboard data and page build =====
const BEATS = [
  { t: '0.0 – 3.5 s', name: 'Missed call', text: 'Every missed call is a missed customer. · Missed call · after hours · Nobody picks up.', kind: 'cont',
    from: 'Opening shot. Title words pop in over a ringing phone with red ring arcs. The 02:14 AM clock rolls in on the right. At 3.2 s the phone is answered: a green ripple sweeps out and the phone slides left.',
    sound: 'Room hum, two-tone phone ring twice, a low falling blip for “nobody picks up”, then a click and rising shimmer as the call is answered.',
    en: 'A customer calls at 2 a.m. Nobody answers.', hi: 'रात दो बजे ग्राहक का कॉल। कोई जवाब नहीं।' },
  { t: '3.5 – 7.0 s', name: 'Meet Maya', text: 'Meet Maya · answers every call, 24/7 · Maya · AI receptionist · Hi, you’ve reached iLogix. How can I help?', kind: 'cont',
    from: 'Continuous. The answered call link draws to the Maya orb, which powers on with a pulse ring and a moving voice waveform. A greeting bubble pops in.',
    sound: 'Power-on swell, soft pluck chord, tick per waveform pulse, pop for the bubble, chip pops.',
    en: 'Meet Maya, an AI receptionist that answers every call, 24/7.', hi: 'मिलिए माया से, एक AI रिसेप्शनिस्ट जो हर कॉल उठाती है, चौबीसों घंटे।' },
  { t: '7.0 – 11.5 s', name: 'What Maya collects', text: 'Maya collects the details · Name · Phone number · Reason for calling · then hands off to your team', kind: 'cont',
    from: 'Continuous. The orb slides left and shrinks into the flow. Three field cards stack in one by one, each ticking green, then lines carry the data to the Your team node.',
    sound: 'Rising ding on each tick (three notes), data-packet blips along the links, success ding when the team node lights up.',
    en: 'She notes the name, number and reason, then hands off to your team.', hi: 'वो नाम, नंबर और वजह नोट करती है, फिर आपकी टीम को सौंप देती है।' },
  { t: '11.5 – 14.5 s', name: 'Beyond answering', text: 'Agentic AI doesn’t just answer. It acts.', kind: 'cut',
    from: 'Scene change. The team node’s glow expands into a full-screen cyan shock ring, then clears to a new frame: a big agent node with mail, calendar and check nodes flying out of it.',
    sound: 'Sub-bass swell and riser into the flash, glassy hit on “It acts.”, ping per satellite node.',
    en: 'But agentic AI does more than answer. It acts.', hi: 'लेकिन एजेंटिक AI सिर्फ़ जवाब नहीं देता, काम भी करता है।' },
  { t: '14.5 – 19.5 s', name: 'Plan, act, verify', text: 'Plan. Act. Verify. · repeat until done · qualify leads · draft replies · triage support', kind: 'cont',
    from: 'Continuous. The agent node splits into three and slides into a row. The Verify node loops a dotted line back to Plan. Three job chips pop in underneath.',
    sound: 'One pluck per node (rising), loop whoosh as the dotted line draws, soft tock per job chip.',
    en: 'It plans, acts, and verifies. Qualifying leads, drafting replies, triaging support.', hi: 'यह प्लान करता है, काम करता है, और जाँचता है। लीड छाँटना, जवाब लिखना, सपोर्ट संभालना।' },
  { t: '19.5 – 24.0 s', name: 'Connected to your tools', text: 'Wired into your tools · n8n · Make · GoHighLevel · Vapi · CRM · Email · WhatsApp · Calendar · Documents', kind: 'cont',
    from: 'Continuous. The Verify node’s glow becomes the hub, and the Plan/Act/Verify row dissolves into spokes. Five tool nodes pop around it, one per spoke, with the tool-name chips along the top.',
    sound: 'Radiating ping per spoke, tick per tool chip, steady low pulse under the hub.',
    en: 'Connected to your CRM, email, WhatsApp and calendar. No manual handoffs.', hi: 'आपके CRM, ईमेल, WhatsApp और कैलेंडर से जुड़ा, बिना मैन्युअल हैंडऑफ़ के।' },
  { t: '24.0 – 27.5 s', name: 'Guardrails', text: 'Guardrails keep it on track · Draft reply · Guardrail check · Stays in control · allowed actions only · approved data only · hand-off to a human', kind: 'cut',
    from: 'Scene change. A grid push moves the camera forward and the spokes collapse into one shield node. An action card travels through the shield and lands on the team card.',
    sound: 'Whoosh on the push, lock thud as the shield closes, ding when the action passes, chips tick in.',
    en: 'Guardrails keep every action on track.', hi: 'गार्डरेल्स हर काम को सही रास्ते पर रखते हैं।' },
  { t: '27.5 – 31.5 s', name: 'Process', text: 'From idea to live in weeks · Discover · Build · Scale · Fixed price, quoted upfront · Delivered in weeks', kind: 'cont',
    from: 'Continuous. The shield drops down and splits into three step cards. Arrows link them, and the two promise chips pop in underneath.',
    sound: 'Rising pop per card, a stamp on “Fixed price”, ding on “Delivered in weeks”.',
    en: 'Discover, build, scale. Fixed price, delivered in weeks.', hi: 'डिस्कवर, बिल्ड, स्केल। फ़िक्स्ड प्राइस, कुछ ही हफ़्तों में डिलीवरी।' },
  { t: '31.5 – 35.0 s', name: 'Call to action', text: 'iLogix Digital · Engineering-led since 2015 · Talk to Maya · Book a free discovery call · ilogixdigital.com · Software, AI and growth systems for ambitious businesses.', kind: 'cont',
    from: 'Continuous. The three step cards converge into the Talk to Maya button, the wordmark glows in at the top, and the URL types on. Held about one second at the end.',
    sound: 'Warm resolving chord on the button, sparkle on the wordmark, key ticks as the URL types, soft outro tail.',
    en: 'Talk to Maya, or book a free call with iLogix.', hi: 'माया से बात कीजिए, या iLogix के साथ फ़्री कॉल बुक कीजिए।' },
];
const FACTS = [
  'From your website: Maya answers 24/7 and collects name, phone number and reason for calling, then hands off to your team. Agentic AI follows Plan, Act, Verify with guardrails, and handles jobs like qualifying leads, drafting replies and triaging support. Tools named: n8n, Make, GoHighLevel, Vapi. Process: Discover, Build, Scale, with a fixed-price quote and delivery in weeks. Calls to action: Talk to Maya and Book a free discovery call.',
  'My own illustrations, not from the site: the 02:14 AM missed-call hook, Maya’s greeting line, the short descriptions under Plan, Act and Verify, the “repeat until done” label, and the three example guardrails. The Maya conversation is a scripted example, not a real call.',
  'I left out the numbers on your site (10+ years, 50+ automations, 4+ countries) to keep the video to one idea. I can add “50+ automations shipped” to the last beat if you want proof.',
  'Your site gives no brand colors, and I only used a plain-text wordmark. I used a dark navy with cyan and violet glow. Send your logo and colors and I will match them.',
  'This is my own take on the Tech Glow look (neon-edged cards, node diagrams, pulsing light), built with the same drawing and sound toolkit as the Earth video. It is not the atlas’s exact source for that style. Paste that style’s prompt and I will rebuild in its exact look.',
  'Length is 35 seconds at 16:9 (1280×720). It works for the website, LinkedIn and YouTube. A 9:16 version for Reels and Shorts needs a re-layout, and I can do it. On-screen text is English. The Hindi voiceover lines are below, and a Hindi on-screen version is possible.',
  'The Hindi lines keep common English terms (AI, CRM, WhatsApp, Discover/Build/Scale) the way they are spoken in everyday Hindi.',
];
function buildPage() {
  const grid = document.getElementById('grid');
  BEATS.forEach((b, i) => {
    const li = document.createElement('li'); li.className = 'card';
    li.innerHTML = '<canvas width="1280" height="720" id="p' + i + '" aria-label="Key frame for beat ' + (i + 1) + ': ' + b.name + '"></canvas>' +
      '<div class="meta"><div class="tag"><b>' + (i + 1) + '</b><span>' + b.t + '</span><i>' + b.name + '</i></div>' +
      '<dl class="row"><dt>On-screen text</dt><dd>' + b.text + '</dd></dl>' +
      '<dl class="row"><dt>How it gets here</dt><dd><span class="chip ' + b.kind + '">' + (b.kind === 'cut' ? 'Scene change' : 'Continuous') + '</span>' + b.from + '</dd></dl>' +
      '<dl class="row"><dt>Key sounds</dt><dd>' + b.sound + '</dd></dl>' +
      '<dl class="row"><dt>Voiceover · English</dt><dd>' + b.en + '</dd></dl>' +
      '<dl class="row"><dt>Voiceover · Hindi</dt><dd lang="hi">' + b.hi + '</dd></dl></div>';
    grid.appendChild(li);
  });
  const ul = document.getElementById('facts');
  FACTS.forEach((f) => { const li = document.createElement('li'); li.textContent = f; ul.appendChild(li); });
}
async function drawAll() {
  try { await Promise.all(['800 66px "Sora"', '700 26px "Sora"', '600 20px "IBM Plex Mono"'].map((f) => document.fonts.load(f, 'AaZz09?'))); await document.fonts.ready; } catch (e) { /* draw with fallbacks */ }
  PANELS.forEach((fn, i) => {
    const cv = document.getElementById('p' + i), x = cv.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
    try { fn(x, PANEL_T[i]); tfinish(x, PANEL_T[i]); }
    catch (err) { x.fillStyle = '#ff3b5c'; x.font = '28px sans-serif'; x.fillText('Panel ' + (i + 1) + ' failed: ' + err.message, 40, 60); console.error(err); }
  });
}
buildPage();
drawAll();
