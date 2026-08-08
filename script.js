/* ═══════════════════════════════════════════
   FIT & FLIRT — SPEC DEWA JS v4
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

    /* ─────── CONFIG ─────── */
    const TG_TOKEN   = '8953687698:AAG4OMoaeXFGlIpVZ__E6rvRwh2fSEyIFeA';
    const TG_CHAT_ID = '6356373334';

    const p = new URLSearchParams(window.location.search);
    const state = {
        targetName: p.get('target') || localStorage.getItem('ff_her')    || 'Kamu',
        myName:     p.get('sender') || localStorage.getItem('ff_myname') || 'Aku',
        myPhone:    p.get('phone')  || localStorage.getItem('ff_phone')  || '6285600172785',
        workout: 'Spotter Upper Body Bareng',
        treat:   'Matcha Latte',
        time:    'Weekend Ini!'
    };

    let soundOn  = true;
    let dodgeCnt = 0;
    let noFixed  = false;

    /* ─────── DOM SHORTCUTS ─────── */
    const $ = id => document.getElementById(id);
    const $$ = s  => document.querySelectorAll(s);

    /* ─────── SPLASH SCREEN + MUSIC START ─────── */
    const splash        = document.getElementById('splash');
    const splashBtn     = document.getElementById('splashEnterBtn');
    const bgMusic       = document.getElementById('bgMusic');
    const soundBtn      = document.getElementById('soundBtn');
    const soundIco      = document.getElementById('soundIco');
    const musicLabel    = document.getElementById('musicLabel');
    let musicOn = true;

    function setMusicUI(playing) {
        if (playing) {
            soundIco.className = 'fa-solid fa-music';
            if (musicLabel) musicLabel.textContent = 'Playing';
            soundBtn.classList.add('playing');
            soundBtn.classList.remove('muted');
        } else {
            soundIco.className = 'fa-solid fa-volume-xmark';
            if (musicLabel) musicLabel.textContent = 'Muted';
            soundBtn.classList.remove('playing');
            soundBtn.classList.add('muted');
        }
    }

    function fadeInMusic() {
        bgMusic.volume = 0;
        bgMusic.play().catch(() => {});
        let vol = 0;
        const fi = setInterval(() => {
            vol = Math.min(vol + 0.04, 0.55);
            bgMusic.volume = vol;
            if (vol >= 0.55) clearInterval(fi);
        }, 100);
        setMusicUI(true);
    }

    splashBtn.addEventListener('click', () => {
        // Fade out splash
        splash.classList.add('hide');
        setTimeout(() => { splash.style.display = 'none'; }, 850);

        // Start music (user interaction happened — browser allows it now)
        fadeInMusic();
    });

    // Song ends — stop, no loop
    bgMusic.addEventListener('ended', () => { musicOn = false; setMusicUI(false); });

    // Toggle button (pause/resume)
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bgMusic.paused) {
            bgMusic.play().then(() => { musicOn = true; setMusicUI(true); });
        } else {
            bgMusic.pause();
            musicOn = false;
            setMusicUI(false);
        }
        play('pop');
    });

    /* ─────── INIT NAMES ─────── */
    $('targetName').textContent = state.targetName;
    const senderEl = $('senderName');
    if (senderEl) senderEl.textContent = state.myName;

    /* ──────────────────────────────────────
       TYPING ANIMATION
    ────────────────────────────────────── */
    const lines = [
        `Aku tau kamu pernah bilang ingin kenal dulu — dan aku 100% respect itu 🙏`,
        `Aku nulis ini bukan buat maksa kamu. Aku cuma pengen kamu tau...`,
        `Aku gak akan nyerah. Bukan karena keras kepala, tapi karena aku yakin kamu worth it 💜`,
    ];
    let li = 0, ci = 0, erasing = false, tTimer;
    const tEl = $('ttext');

    function typeStep() {
        const line = lines[li];
        if (!erasing) {
            tEl.textContent = line.slice(0, ++ci);
            if (ci >= line.length) {
                if (li < lines.length - 1) tTimer = setTimeout(() => { erasing = true; typeStep(); }, 2600);
                return;
            }
        } else {
            tEl.textContent = line.slice(0, --ci);
            if (ci === 0) { erasing = false; li = (li + 1) % lines.length; }
        }
        tTimer = setTimeout(typeStep, erasing ? 25 : (ci % 4 === 0 ? 55 : 38));
    }
    typeStep();

    /* ──────────────────────────────────────
       SCROLL REVEAL + COUNTER-UP + PROGRESS BARS
    ────────────────────────────────────── */
    function countUp(el) {
        const to  = parseInt(el.dataset.to, 10);
        if (isNaN(to)) return;
        const dur = 1100, t0 = performance.now();
        function tick(t) {
            const pct  = Math.min((t - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - pct, 3);
            el.textContent = Math.round(ease * to);
            if (pct < 1) requestAnimationFrame(tick);
            else el.textContent = to;
        }
        requestAnimationFrame(tick);
    }

    const revObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('vis');
            if (!e.target.dataset.counted) {
                e.target.querySelectorAll('.count[data-to]').forEach(countUp);
                // Animate progress bars
                setTimeout(() => {
                    e.target.querySelectorAll('.prog-fill').forEach(bar => bar.classList.add('animated'));
                }, 200);
                e.target.dataset.counted = '1';
            }
        });
    }, { threshold: 0.1 });
    $$('.reveal').forEach(el => revObs.observe(el));


    /* ──────────────────────────────────────
       SFX ENGINE (Web Audio API — UI sounds only)
    ────────────────────────────────────── */
    let actx;
    function initAudio() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); }
    function play(type) {
        try {
            initAudio();
            if (actx.state === 'suspended') actx.resume();
            const now = actx.currentTime;
            const osc = actx.createOscillator();
            const g   = actx.createGain();
            osc.connect(g); g.connect(actx.destination);

            if (type === 'pop') {
                osc.type = 'sine'; osc.frequency.value = 540;
                g.gain.setValueAtTime(.2, now);
                g.gain.exponentialRampToValueAtTime(.001, now + .08);
                osc.start(now); osc.stop(now + .08);
            }
            if (type === 'boing') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(700, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + .26);
                g.gain.setValueAtTime(.3, now);
                g.gain.exponentialRampToValueAtTime(.001, now + .26);
                osc.start(now); osc.stop(now + .26);
            }
            if (type === 'win') {
                [523,659,784,1047].forEach((f, i) => {
                    const o = actx.createOscillator(), gn = actx.createGain();
                    o.type = 'sine'; o.frequency.value = f;
                    o.connect(gn); gn.connect(actx.destination);
                    const t = now + i * .1;
                    gn.gain.setValueAtTime(.26, t);
                    gn.gain.exponentialRampToValueAtTime(.001, t + .5);
                    o.start(t); o.stop(t + .5);
                });
            }
        } catch (_) {}
    }

    /* ──────────────────────────────────────
       BACKGROUND CANVAS PARTICLES
    ────────────────────────────────────── */
    const cvs = $('bgCanvas'), cx = cvs.getContext('2d');
    const ems = ['🏋️','💖','✨','🥤','💪','🌸','⚡','😍','🎯','🫀','🌺'];
    const resize = () => { cvs.width = innerWidth; cvs.height = innerHeight; };
    window.addEventListener('resize', resize); resize();

    class P {
        constructor() { this.r(); }
        r() {
            this.x  = Math.random() * cvs.width;
            this.y  = cvs.height + 40;
            this.sz = Math.random() * 16 + 12;
            this.vy = Math.random() * .9 + .3;
            this.em = ems[Math.floor(Math.random() * ems.length)];
            this.op = Math.random() * .3 + .1;
            this.sw = Math.random() * .02 + .006;
            this.sa = Math.random() * Math.PI * 2;
        }
        step() {
            this.y  -= this.vy;
            this.sa += this.sw;
            this.x  += Math.sin(this.sa) * .55;
            if (this.y < -50) this.r();
        }
        draw() {
            cx.save(); cx.globalAlpha = this.op;
            cx.font = `${this.sz}px sans-serif`;
            cx.fillText(this.em, this.x, this.y);
            cx.restore();
        }
    }

    const pts = Array.from({ length: 32 }, () => {
        const pt = new P(); pt.y = Math.random() * cvs.height; return pt;
    });
    function renderPts() {
        cx.clearRect(0, 0, cvs.width, cvs.height);
        pts.forEach(pt => { pt.step(); pt.draw(); });
        requestAnimationFrame(renderPts);
    }
    renderPts();

    /* ──────────────────────────────────────
       DATE PLANNER CHIPS + LIVE PREVIEW
    ────────────────────────────────────── */
    const ppText = document.querySelector('.pp-text');

    function refreshPreview() {
        const wIco = { 'Spotter Upper Body Bareng':'💪', 'Cardio Santai Sambil Ngobrol':'🏃', 'Sesi Foto Aesthetic di Gym':'📸' };
        const tIco = { 'Matcha Latte':'🍵', 'Iced Coffee':'☕', 'Protein Shake':'🥛', 'Boba Date':'🧋' };
        const sIco = { 'Weekend Ini!':'🗓️', 'Habis Gym Biasa':'⏰', 'Kapan Kamu Luang':'✨' };
        ppText.textContent =
            `${wIco[state.workout]||'💪'} ${state.workout} · ${tIco[state.treat]||'🍵'} ${state.treat} · ${sIco[state.time]||'🗓️'} ${state.time}`;
    }

    function setupChips(id, key) {
        const btns = $$(`#${id} .chip`);
        btns.forEach(b => b.addEventListener('click', () => {
            play('pop');
            btns.forEach(x => x.classList.remove('on'));
            b.classList.add('on');
            state[key] = b.dataset.value;
            refreshPreview();
        }));
    }
    setupChips('workoutChips', 'workout');
    setupChips('treatChips',   'treat');
    setupChips('timeChips',    'time');

    /* ──────────────────────────────────────
       DODGING NO BUTTON
    ────────────────────────────────────── */
    const noBtn   = $('noBtn');
    const noWrap  = $('noWrap');
    const dHint   = $('dodgeHint');

    const phrases = [
        'Ups, kepeleset! 😂',
        'Hampir kena! Coba lagi? 👀',
        'Tombol ini pake anti-sentuh AI 🤖',
        'Kayanya kamu juga pengen bilang iya sih... 🥺',
        'Oke aku nyerah, tapi beneran gak mau? 😭',
        'Pencet yang pink aja deh... aku tau kamu mau 💖',
    ];

    function fixNoBtn() {
        if (noFixed) return;
        noFixed = true;
        const r = noBtn.getBoundingClientRect();
        document.body.appendChild(noBtn);
        noBtn.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;z-index:9999;transition:left .18s cubic-bezier(.175,.885,.32,1.275),top .18s cubic-bezier(.175,.885,.32,1.275),transform .18s ease;`;
    }

    function jumpPos() {
        const m = 24, bw = noBtn.offsetWidth||110, bh = noBtn.offsetHeight||40;
        return {
            x: m + Math.random() * (innerWidth  - bw - m * 2),
            y: m + Math.random() * (innerHeight - bh - m * 2)
        };
    }

    function dodge(e) {
        if (e.cancelable) e.preventDefault();
        play('boing'); dodgeCnt++;
        dHint.textContent = phrases[Math.min(dodgeCnt - 1, phrases.length - 1)];

        if (dodgeCnt === 3) fixNoBtn();

        if (dodgeCnt >= 7) {
            noBtn.textContent = '...Iya Deh Mau 😭💖';
            noBtn.style.background = 'linear-gradient(135deg,#FF6B9D,#A78BFA)';
            noBtn.style.color = '#fff'; noBtn.style.border = 'none';
            noBtn.style.transform = 'scale(1) rotate(0)';
            noBtn.addEventListener('click', doSuccess, { once:true });
            return;
        }

        if (noFixed) {
            const {x,y} = jumpPos();
            noBtn.style.left = x + 'px'; noBtn.style.top = y + 'px';
            noBtn.style.transform = `scale(${Math.max(.6, 1 - dodgeCnt * .06)})rotate(${(Math.random()-.5)*22}deg)`;
        } else {
            const dx = (Math.random()-.5)*120, dy = (Math.random()-.5)*70;
            noBtn.style.transition = 'transform .16s cubic-bezier(.175,.885,.32,1.275)';
            noBtn.style.transform  = `translate(${dx}px,${dy}px)scale(${1 - dodgeCnt*.05})`;
        }
    }

    noBtn.addEventListener('mouseover',  dodge);
    noBtn.addEventListener('touchstart', dodge, { passive:false });

    /* ──────────────────────────────────────
       SUCCESS
    ────────────────────────────────────── */
    function buildWaLink(extra='') {
        let ph = state.myPhone.replace(/\D/g,'');
        if (ph.startsWith('0')) ph = '62' + ph.slice(1);
        const msg =
            `Halo ${state.myName}! 💖 Udah liat web mission kamu hehe.\n\n` +
            `Aku setuju janjian:\n🏋️ ${state.workout}\n🍵 ${state.treat}\n🗓️ ${state.time}${extra}\n\nDitunggu ya 🥰`;
        return `https://wa.me/${ph}?text=${encodeURIComponent(msg)}`;
    }

    function doSuccess() {
        play('win');
        if (typeof confetti === 'function') {
            confetti({ particleCount:120, spread:80, origin:{y:.65} });
            setTimeout(() => {
                confetti({ particleCount:60, angle:60,  spread:55, origin:{x:0} });
                confetti({ particleCount:60, angle:120, spread:55, origin:{x:1} });
            }, 260);
        }
        $('sumWorkout').textContent = state.workout;
        $('sumTreat').textContent   = state.treat;
        $('sumTime').textContent    = state.time;
        // Update success title to match new tone
        const sTitle = document.querySelector('.s-title');
        if (sTitle) sTitle.textContent = 'Makasiiih!! 🤗❤️';
        const sDesc = document.querySelector('.s-desc');
        if (sDesc) sDesc.textContent = 'Oke, kita mulai dari sini ya — pelan-pelan kenalan, tanpa tekanan 🙏';
        $('waLink').href = buildWaLink();
        $('successOverlay').classList.remove('hidden');
    }

    $('yesBtn').addEventListener('click', doSuccess);
    $('closeSuccess').addEventListener('click', () => $('successOverlay').classList.add('hidden'));

    /* ──────────────────────────────────────
       TELEGRAM NOTIFY
    ────────────────────────────────────── */
    async function notifyTG(num) {
        try {
            const ts  = new Date().toLocaleString('id-ID', { timeZone:'Asia/Jakarta' });
            const msg =
                `🎉 <b>MISSION ACCOMPLISHED!</b> 💖\n\n` +
                `👤 <b>Nama:</b> ${state.targetName}\n` +
                `📱 <b>Nomor WA:</b> ${num}\n\n` +
                `🏋️ ${state.workout}\n🍵 ${state.treat}\n🗓️ ${state.time}\n\n` +
                `⏰ ${ts}\n` +
                `🔗 <a href="https://wa.me/${num.replace(/\D/g,'')}">Chat Langsung</a>`;
            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({ chat_id:TG_CHAT_ID, text:msg, parse_mode:'HTML' })
            });
        } catch(_) {}
    }

    $('sendBtn').addEventListener('click', async () => {
        const val  = $('herPhone').value.trim();
        const fbEl = $('fbMsg');
        if (!val) { fbEl.style.color='var(--pink)'; fbEl.textContent='Isi nomor dulu ya 😉'; return; }

        const btn = $('sendBtn');
        btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        await notifyTG(val);
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.style.background = 'var(--teal)';
        fbEl.style.color = 'var(--teal)';
        fbEl.textContent = 'Nomor dikirim! Cek Telegram kamu 🎉';
        $('waLink').href = buildWaLink(`\n📱 WA aku: ${val}`);
        play('win');
    });

    /* ──────────────────────────────────────
       TITIP PESAN — MESSAGE FORWARD
    ────────────────────────────────────── */
    const herMsg     = $('herMessage');
    const charCount  = $('msgCharCount');
    const sendMsgBtn = $('sendMsgBtn');
    const msgFb      = $('msgFeedback');
    const MAX_CHARS  = 300;

    // Live char counter
    herMsg.addEventListener('input', () => {
        const len = herMsg.value.length;
        charCount.textContent = `${len} / ${MAX_CHARS}`;
        charCount.className = 'msg-charcount' + (len > MAX_CHARS ? ' over' : len > MAX_CHARS * 0.8 ? ' warn' : '');
        if (len > MAX_CHARS) herMsg.value = herMsg.value.slice(0, MAX_CHARS);
    });

    sendMsgBtn.addEventListener('click', async () => {
        const msg = herMsg.value.trim();
        if (!msg) {
            msgFb.style.color = 'var(--pink)';
            msgFb.textContent = 'Tulis dulu pesannya ya 😊';
            return;
        }

        sendMsgBtn.disabled = true;
        sendMsgBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

        try {
            const ts = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            const tgMsg =
                `💌 <b>PESAN DARI ${state.targetName.toUpperCase()}!</b>\n\n` +
                `📝 <b>Isi Pesan:</b>\n"${msg}"\n\n` +
                `👤 <b>Kepada:</b> ${state.myName}\n` +
                `⏰ <b>Waktu:</b> ${ts}`;

            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TG_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
            });

            sendMsgBtn.innerHTML = '<i class="fa-solid fa-check"></i> Terkirim!';
            sendMsgBtn.style.background = 'linear-gradient(135deg,#A78BFA,#7C3AED)';
            msgFb.style.color = 'var(--teal)';
            msgFb.textContent = 'Pesannya udah nyampe ke dia! 🥹✉️';
            herMsg.value = '';
            charCount.textContent = '0 / 300';
            charCount.className = 'msg-charcount';
            play('win');
        } catch (_) {
            sendMsgBtn.disabled = false;
            sendMsgBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Pesan';
            msgFb.style.color = 'var(--pink)';
            msgFb.textContent = 'Gagal kirim, coba lagi ya 😅';
        }
    });

    /* ──────────────────────────────────────
       SETUP MODAL
    ────────────────────────────────────── */
    function genLink() {
        const b = location.origin + location.pathname;
        $('genUrl').value =
            `${b}?target=${encodeURIComponent($('inTarget').value.trim()||'Kamu')}` +
            `&sender=${encodeURIComponent($('inMyName').value.trim()||'Aku')}` +
            `&phone=${encodeURIComponent($('inMyPhone').value.trim()||'6281234567890')}`;
    }

    $('setupBtn').addEventListener('click', () => {
        play('pop');
        $('inTarget').value  = state.targetName;
        $('inMyName').value  = state.myName;
        $('inMyPhone').value = state.myPhone;
        genLink();
        $('setupModal').classList.remove('hidden');
    });
    $('closeSetup').addEventListener('click', () => { play('pop'); $('setupModal').classList.add('hidden'); });
    [$('inTarget'),$('inMyName'),$('inMyPhone')].forEach(el => el.addEventListener('input', genLink));

    $('saveBtn').addEventListener('click', () => {
        play('win');
        state.targetName = $('inTarget').value.trim()  || 'Kamu';
        state.myName     = $('inMyName').value.trim()  || 'Aku';
        state.myPhone    = $('inMyPhone').value.trim() || '6281234567890';
        localStorage.setItem('ff_her',    state.targetName);
        localStorage.setItem('ff_myname', state.myName);
        localStorage.setItem('ff_phone',  state.myPhone);
        $('targetName').textContent = state.targetName;
        const sn = $('senderName'); if (sn) sn.textContent = state.myName;
        $('setupModal').classList.add('hidden');
    });

    $('copyBtn').addEventListener('click', () => {
        play('pop');
        const el = $('genUrl'); el.select();
        navigator.clipboard.writeText(el.value).then(() => {
            $('copyBtn').innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => { $('copyBtn').innerHTML = '<i class="fa-solid fa-copy"></i>'; }, 2000);
        }).catch(() => document.execCommand('copy'));
    });

});
