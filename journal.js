document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let selectedDate = new Date();
  let calendarInstance = null;
  let savedRange = null;

  // --- ELEMENTS ---
  const appContainer = document.getElementById('app-container');
  const journalContent = document.getElementById('journal-content');
  const journalFooter  = document.getElementById('journal-footer');
  const backBtn        = document.getElementById('back-btn');
  const calendarModalOverlay = document.getElementById('calendar-modal-overlay');
  const calendarContainer    = document.getElementById('calendar-container');

  // --- DATA ---
  const FONT_LIST = [
    'Arial','Verdana','Georgia','Times New Roman','Courier New',
    'Trebuchet MS','Inter','Roboto','Lato','Montserrat'
  ];

  // --- STORAGE & HELPERS ---
  const getJournalEntries = () => JSON.parse(localStorage.getItem('journalEntries')) || {};
  const saveJournalEntries = (entries) => localStorage.setItem('journalEntries', JSON.stringify(entries));
  const toDateKey = (date) => date.toISOString().split('T')[0];
  const editorEl = () => document.getElementById('journal-body-editor');

  const saveSelection = (root) => {
    if (!root) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    if (root.contains(r.startContainer) && root.contains(r.endContainer)) {
      savedRange = r.cloneRange();
    }
  };

  const restoreSelection = (root) => {
    if (!root) return;
    const sel = window.getSelection();
    if (!savedRange) { return placeCaretAtEnd(root); }
    sel.removeAllRanges();
    sel.addRange(savedRange);
  };

  const placeCaretAtEnd = (el) => {
    if (!el) return;
    el.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  };

  const applyExec = (cmd, value = null) => {
    const ed = editorEl();
    restoreSelection(ed);
    document.execCommand(cmd, false, value);
    ed.focus();
    saveSelection(ed);
  };

  const wrapInline = (styleObj) => {
    const ed = editorEl();
    restoreSelection(ed);
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    Object.assign(span.style, styleObj);
    if (!range.collapsed) {
      try { range.surroundContents(span); }
      catch { span.appendChild(range.extractContents()); range.insertNode(span); }
    } else {
      span.appendChild(document.createTextNode('\u200B'));
      range.insertNode(span);
    }
    const r = document.createRange();
    r.selectNodeContents(span);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
    ed.focus();
    saveSelection(ed);
  };

  // --- UI LOCK (disable toolbar saat modal/prompt) ---
  function lockToolbarUI(lock = true) {
    if (lock) appContainer.classList.add('ui-locked');
    else appContainer.classList.remove('ui-locked');
  }

  // --- FONT PALETTE ---
  function openFontPalette() {
    window.dispatchEvent(new CustomEvent('pb:hidePopout'));
    const palette = document.getElementById('font-palette-overlay');
    const input = document.getElementById('font-search-input');
    if (!palette || !input) return;

    lockToolbarUI(true);

    // display:none -> show; fade-in next frame (anti-blink)
    palette.classList.remove('hidden');
    palette.classList.add('opacity-0', 'pointer-events-none');
    requestAnimationFrame(() => {
      palette.classList.remove('opacity-0', 'pointer-events-none');
    });

    input.value = '';
    renderFontList();
    setTimeout(() => input.focus(), 10);
  }

  function closeFontPalette() {
    const palette = document.getElementById('font-palette-overlay');
    if (!palette) return;

    palette.classList.add('opacity-0', 'pointer-events-none');

    const onEnd = () => {
      palette.classList.add('hidden');
      palette.removeEventListener('transitionend', onEnd);
      lockToolbarUI(false);
    };
    palette.addEventListener('transitionend', onEnd);

    setTimeout(() => { // fallback
      if (!palette.classList.contains('hidden')) {
        palette.classList.add('hidden');
        lockToolbarUI(false);
      }
    }, 250);
  }

  function renderFontList(filter = '') {
    const listEl = document.getElementById('font-list');
    if (!listEl) return;
    const filtered = FONT_LIST.filter(f => f.toLowerCase().includes(filter.toLowerCase()));
    if (!filtered.length) {
      listEl.innerHTML = `<div class="p-4 text-center text-gray-500">No fonts found.</div>`;
      return;
    }
    listEl.innerHTML = filtered.map(font =>
      `<div class="font-item cursor-pointer" data-font-name="${font}"
           style="font-family:${font},sans-serif; padding:10px 16px; border-bottom:1px solid #f3f4f6;">
        ${font}
      </div>`).join('');
    listEl.querySelectorAll('.font-item').forEach(item => {
      item.addEventListener('click', () => { applyExec('fontName', item.dataset.fontName); closeFontPalette(); });
    });
  }

  function openFontSizePrompt() {
    window.dispatchEvent(new CustomEvent('pb:hidePopout'));
    lockToolbarUI(true);
    let size = prompt("Enter font size (px):", "16");
    if (size && !isNaN(size)) wrapInline({ fontSize: `${size}px` });
    lockToolbarUI(false);
  }

  // === RENDER ===
  function renderEditor() {
    journalContent.innerHTML = `
    <input
      type="text"
      id="journal-title-input"
      placeholder="Write your title here"
      class="w-full bg-transparent text-3xl font-extrabold focus:outline-none text-gray-800 placeholder-gray-300"
    >
    <div
      id="journal-body-editor"
      contenteditable="true"
      data-placeholder="Write your thoughts here..."
      class="w-full flex-grow mt-4 bg-transparent focus:outline-none text-gray-700 leading-relaxed min-h-[320px]"
    ></div>
  `;

    journalFooter.innerHTML = `
      <button id="save-btn" class="w-full bg-primary-gradient text-white font-bold py-4 rounded-xl">Save Entry</button>
    `;

    const ICON = {
      plus:`<svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>`,
      close:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,

      textGrp:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M6 7h12v2H6zM6 11h8v2H6zM6 15h12v2H6z"/></svg>`,
      fontGrp:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M4 19h2.6l1.1-3h8.6l1.1 3H20L13 5h-2L4 19zm5-5l3-7 3 7H9z"/></svg>`,
      insertGrp:`<svg viewBox="0 0 24 24" class="w-5 h-5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke="currentColor" fill="none" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2"/></svg>`,
      paraGrp:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M4 6h16v2H4zM7 10h10v2H7zM4 14h16v2H4zM7 18h10v2H7z"/></svg>`,

      bold:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M7 5h6a4 4 0 010 8H7V5zm0 10h7a3 3 0 010 6H7v-6z"/></svg>`,
      italic:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M10 5v2h2.58l-3.16 10H7v2h7v-2h-2.58l3.16-10H17V5z"/></svg>`,
      underline:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M6 4v7a6 6 0 0012 0V4h-2v7a4 4 0 11-8 0V4H6zm-1 16v2h14v-2H5z"/></svg>`,

      font:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M4 19h2.6l1.1-3h8.6l1.1 3H20L13 5h-2L4 19zm5-5l3-7 3 7H9z"/></svg>`,
      fontSize:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M3 18h6v-2H6V6H4v10H3v2zm10 0h8v-2h-3V8h-2v8h-3v2z"/></svg>`,
      textColor:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M5 20h14v2H5z"/><path fill="currentColor" d="M12 4l5 12h-2l-1-3H10l-1 3H7l5-12zm0 3.2L10.6 10h2.8L12 7.2z"/></svg>`,
      highlight:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M3 16l6-6 5 5-6 6H3v-5z"/><path fill="currentColor" d="M14.5 3.5l6 6-3 3-6-6z"/></svg>`,

      link:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M10.59 13.41a1.996 1.996 0 010-2.82l3.18-3.18a2 2 0 112.83 2.83l-1.06 1.06-1.41-1.41 1.06-1.06a.5.5 0 00-.71-.71l-3.18 3.18a.996.996 0 101.41 1.41l.71-.71 1.41 1.41-.71.71a2 2 0 11-2.83-2.83z"/></svg>`,
      image:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M19 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2zm0 12H5V7h14v10z"/><circle cx="8" cy="9" r="1.5" fill="currentColor"/><path fill="currentColor" d="M7 17l3.5-4.5 2.5 3 2-2.5L19 17z"/></svg>`,

      alignLeft:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M3 5h18v2H3zM3 9h12v2H3zM3 13h18v2H3zM3 17h12v2H3z"/></svg>`,
      alignCenter:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M3 5h18v2H3zM6 9h12v2H6zM3 13h18v2H3zM6 17h12v2H6z"/></svg>`,
      bullets:`<svg viewBox="0 0 24 24" class="w-5 h-5"><circle cx="5" cy="7" r="1.5" fill="currentColor"/><path fill="currentColor" d="M9 6h12v2H9z"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><path fill="currentColor" d="M9 11h12v2H9z"/><circle cx="5" cy="17" r="1.5" fill="currentColor"/><path fill="currentColor" d="M9 16h12v2H9z"/></svg>`,
      checklist:`<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M4 6l2 2 3-3 1.5 1.5L6 11 2.5 7.5zM10 6h12v2H10zM10 11h12v2H10zM10 16h12v2H10z"/></svg>`
    };

    const ui = `
      <!-- Toggle open (+) — MULAI HIDDEN & TANPA TRANSITION; diaktifkan setelah mount -->
      <button id="pb-toggle"
        class="pb-hide-initial absolute top-1/2 -translate-y-1/2 right-3 z-50 w-10 h-10 flex items-center justify-center
               bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-lg
               text-gray-700 hover:shadow-xl"
        aria-expanded="false" aria-controls="pb-rail" title="Open toolbar" style="opacity:0; pointer-events:none;">
        ${ICON.plus}
      </button>

      <!-- Close (X) -->
      <button id="pb-close"
        class="hidden absolute right-3 z-50 w-9 h-9 items-center justify-center
               bg-white shadow-lg border border-gray-200 rounded-full text-gray-700
               hover:bg-gray-50 transition"
        title="Close toolbar">
        ${ICON.close}
      </button>

      <!-- Rail (start closed) -->
      <div id="pb-rail"
           class="absolute top-1/2 -translate-y-1/2 right-3 z-40 w-12 max-h-[72vh] overflow-y-auto
                  bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-1.5
                  opacity-0 pointer-events-none translate-x-4">
        <div class="flex flex-col gap-1">
          <button class="pb-btn pb-group" data-panel="text"     title="Text">${ICON.textGrp}</button>
          <button class="pb-btn pb-group" data-panel="font"     title="Font">${ICON.fontGrp}</button>
          <button class="pb-btn pb-group" data-panel="insert"   title="Insert">${ICON.insertGrp}</button>
          <button class="pb-btn pb-group" data-panel="paragraph"title="Paragraph">${ICON.paraGrp}</button>
        </div>
      </div>

      <!-- Popout (auto-size) -->
      <div id="pb-popout" class="hidden absolute z-50"></div>

      <!-- Font palette (START HIDDEN to avoid blink) -->
      <div id="font-palette-overlay"
           class="hidden absolute inset-0 z-[60] bg-gray-900/10 backdrop-blur-sm flex justify-center items-start pt-20
                  transition-opacity opacity-0 pointer-events-none">
        <div class="w-full max-w-xs bg-white rounded-xl shadow-2xl overflow-hidden">
          <input type="text" id="font-search-input" class="w-full p-4 border-b border-gray-200 focus:outline-none" placeholder="Search fonts...">
          <div id="font-list" class="max-h-60 overflow-y-auto"></div>
        </div>
      </div>
    `;

    // inject UI
    document.querySelectorAll('#pb-toggle,#pb-close,#pb-rail,#pb-popout,#font-palette-overlay').forEach(el => el.remove());
    appContainer.insertAdjacentHTML('beforeend', ui);

    // CSS once
    const styleId = 'pb-rail-styles';
    if (!document.getElementById(styleId)) {
      const st = document.createElement('style');
      st.id = styleId;
      st.textContent = `
        /* Disable ALL transitions/animations before app is ready */
        .pb-preload * { transition:none !important; animation:none !important; }

        /* Transitions hanya aktif setelah .pb-ready terpasang di container */
        #pb-rail, .pb-btn, #pb-toggle { transition:none; }
        .pb-ready #pb-rail.open { transition: opacity .18s ease, transform .18s ease; }
        .pb-ready .pb-btn { transition: transform .08s ease, background-color .12s ease; }
        .pb-ready #pb-toggle { transition: opacity .15s ease, transform .15s ease, box-shadow .15s ease; }

        .pb-btn{
          width:42px;height:42px; display:flex;align-items:center;justify-content:center;
          border-radius:10px; border:1px solid transparent; background:transparent; cursor:pointer;
          color:#374151;
        }
        .pb-ready .pb-btn:hover{ background:#f3f4f6 }
        .pb-ready .pb-btn:active{ transform:scale(.96) }

        #pb-popout{
          background:rgba(255,255,255,.98);
          border:1px solid #e5e7eb;
          border-radius:12px;
          box-shadow:0 12px 28px rgba(0,0,0,.12);
          padding:6px;
          display:flex;
          flex-direction:column;
          gap:6px;
          width:max-content;
          max-width:220px;
        }
        #pb-popout .btn{
          width:40px;height:40px; display:flex; align-items:center; justify-content:center;
          border-radius:8px; background:transparent; border:1px solid transparent; color:#374151; cursor:pointer;
        }
        .pb-ready #pb-popout .btn:hover{ background:#f3f4f6 }
        .pb-ready #pb-popout .btn:active{ transform:scale(.96) }
        #pb-popout .slot{ display:flex; align-items:center; gap:6px; }
        #pb-popout input[type="color"]{ width:28px; height:28px; border:1px solid #d1d5db; border-radius:6px; cursor:pointer; }

        .ui-locked #pb-toggle, .ui-locked #pb-rail, .ui-locked #pb-popout {
          pointer-events: none !important; opacity:.35; filter:grayscale(.2);
        }

        /* Hide scrollbars */
        #pb-rail, #pb-popout, #font-list { -ms-overflow-style:none; scrollbar-width:none; }
        #pb-rail::-webkit-scrollbar, #pb-popout::-webkit-scrollbar, #font-list::-webkit-scrollbar { display:none; width:0; height:0; }
      `;
      document.head.appendChild(st);
    }

    // Put container in preload (no transitions), then mark ready AFTER first frame
    appContainer.classList.add('pb-preload');

    // reveal (+) WITHOUT animation, then enable transitions for later interactions
    const pbToggle = appContainer.querySelector('#pb-toggle');
    // show immediately with no transition
    pbToggle.style.opacity = '1';
    pbToggle.style.pointerEvents = 'auto';

    requestAnimationFrame(() => {
      // remove preload (still no transitions this frame)
      appContainer.classList.remove('pb-preload');
      // next microtask: enable transitions for subsequent interactions
      setTimeout(() => {
        appContainer.classList.add('pb-ready');
      }, 0);
    });

     attachEditorListeners && attachEditorListeners(ICON);
    updateDatePickerDisplay();
  }

  // --- LISTENERS ---
  function attachEditorListeners(ICON) {
    const ed = editorEl();
    const datePickerBtn = document.getElementById('date-picker-btn');
    const saveBtn = document.getElementById('save-btn');

    const pbToggle = document.getElementById('pb-toggle');
    const pbClose  = document.getElementById('pb-close');
    const pbRail   = document.getElementById('pb-rail');
    const pbPopout = document.getElementById('pb-popout');

    const fontPaletteOverlay = document.getElementById('font-palette-overlay');
    const fontSearchInput = document.getElementById('font-search-input');

    try { document.execCommand('styleWithCSS', false, true); } catch(_) {}
    ['keyup','mouseup','input','focus'].forEach(ev => ed.addEventListener(ev, () => saveSelection(ed)));

    function openPbRail(){
      pbRail.classList.add('open');
      pbRail.style.opacity = '1';
      pbRail.style.pointerEvents = 'auto';
      pbRail.style.transform = 'translateY(-50%) translateX(0)';
      pbToggle.classList.add('hidden');
      pbClose.classList.remove('hidden');
    }
    function closePbRail(){
      pbRail.classList.remove('open');
      pbRail.style.opacity = '0';
      pbRail.style.pointerEvents = 'none';
      pbRail.style.transform = 'translateY(-50%) translateX(1rem)';
      pbToggle.classList.remove('hidden');
      pbClose.classList.add('hidden');
      hidePopout();
    }

    pbToggle?.addEventListener('click', (e)=>{ e.stopPropagation(); openPbRail(); });
    pbClose ?.addEventListener('click',  (e)=>{ e.stopPropagation(); closePbRail(); });

    document.addEventListener('click', (e)=>{
      if (!pbRail.contains(e.target) && e.target !== pbToggle && e.target !== pbClose && !pbPopout.contains(e.target)) {
        closePbRail();
      }
    });

    // POPUP HELPERS (auto-size + smart position)
    function showPopoutFor(btn, type){
      if (type === 'text') {
        pbPopout.innerHTML = `
          <button class="btn" data-cmd="bold"      title="Bold">${ICON.bold}</button>
          <button class="btn" data-cmd="italic"    title="Italic">${ICON.italic}</button>
          <button class="btn" data-cmd="underline" title="Underline">${ICON.underline}</button>
        `;
      }
      if (type === 'font') {
        pbPopout.innerHTML = `
          <button class="btn" id="btn-font"     title="Font">${ICON.font}</button>
          <button class="btn" id="btn-fontsize" title="Font size">${ICON.fontSize}</button>
          <div class="btn slot" title="Text color">
            ${ICON.textColor}
            <input id="color-text" type="color" value="#374151">
          </div>
          <button class="btn" id="btn-highlight" title="Highlight">${ICON.highlight}</button>
        `;
      }
      if (type === 'insert') {
        pbPopout.innerHTML = `
          <button class="btn" id="btn-link"  title="Insert link">${ICON.link}</button>
          <button class="btn" id="btn-image" title="Insert image">${ICON.image}</button>
        `;
      }
      if (type === 'paragraph') {
        pbPopout.innerHTML = `
          <button class="btn" data-align="left"   title="Align left">${ICON.alignLeft}</button>
          <button class="btn" data-align="center" title="Align center">${ICON.alignCenter}</button>
          <button class="btn" data-list="ul"      title="Bulleted list">${ICON.bullets}</button>
          <button class="btn" id="btn-checklist"  title="Checklist">${ICON.checklist}</button>
        `;
      }

      pbPopout.classList.remove('hidden');
      // ukur & posisikan
      const r = btn.getBoundingClientRect();
      const a = appContainer.getBoundingClientRect();
      const w = pbPopout.offsetWidth;
      const h = pbPopout.offsetHeight;

      const btnCenterY = r.top + r.height/2;
      let top = btnCenterY - h/2 - a.top;
      const left = (r.left - a.left) - w - 12;

      const minTop = 8;
      const maxTop = (a.height - h - 8);
      if (top < minTop) top = minTop;
      if (top > maxTop) top = maxTop;

      pbPopout.style.top  = `${top}px`;
      pbPopout.style.left = `${left}px`;

      // actions
      pbPopout.querySelectorAll('.btn[data-cmd]')?.forEach(b=>{
        b.addEventListener('click', ()=>{ applyExec(b.dataset.cmd); hidePopout(); });
      });

      pbPopout.querySelectorAll('.btn[data-align]')?.forEach(b=>{
        b.addEventListener('click', ()=>{
          const v = b.dataset.align;
          if (v==='left')   applyExec('justifyLeft');
          if (v==='center') applyExec('justifyCenter');
          hidePopout();
        });
      });

      pbPopout.querySelectorAll('.btn[data-list]')?.forEach(b=>{
        b.addEventListener('click', ()=>{
          if (b.dataset.list === 'ul') applyExec('insertUnorderedList');
          hidePopout();
        });
      });

      document.getElementById('btn-checklist')?.addEventListener('click', ()=>{
        const ed = editorEl(); restoreSelection(ed);
        const sel=window.getSelection(); if(!sel||sel.rangeCount===0) return;
        const range=sel.getRangeAt(0);
        const block=(range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentNode);
        let ul=block.closest && block.closest('ul.todo');
        if(!ul){
          ul=document.createElement('ul'); ul.className='todo'; ul.style.listStyle='none'; ul.style.paddingLeft='0';
          const li=document.createElement('li'); li.style.display='flex'; li.style.alignItems='center';
          const cb=document.createElement('input'); cb.type='checkbox'; cb.className='mr-2';
          li.appendChild(cb); li.appendChild(document.createTextNode(range.toString()||''));
          if(block.parentNode){ block.parentNode.insertBefore(ul,block); ul.appendChild(li); block.remove(); }
          else { ul.appendChild(li); ed.appendChild(ul); }
        } else {
          const parent=ul.parentNode; if(parent){ const p=document.createElement('p'); p.textContent=ul.innerText.replace(/\n/g,' '); parent.insertBefore(p,ul); ul.remove(); }
        }
        ed.focus(); saveSelection(ed); hidePopout();
      });

      document.getElementById('btn-font')?.addEventListener('click', openFontPalette);
      document.getElementById('btn-fontsize')?.addEventListener('click', openFontSizePrompt);
      document.getElementById('color-text')?.addEventListener('input', e=>{
        window.dispatchEvent(new CustomEvent('pb:hidePopout'));
        applyExec('foreColor', e.target.value);
      });
      document.getElementById('btn-highlight')?.addEventListener('click', ()=>{
        window.dispatchEvent(new CustomEvent('pb:hidePopout'));
        lockToolbarUI(true);
        const col = prompt('Highlight color (hex/rgb)', '#fff59d');
        lockToolbarUI(false);
        if(!col) return;
        try { applyExec('hiliteColor', col); } catch {}
      });

      document.getElementById('btn-link')?.addEventListener('click', ()=>{
        window.dispatchEvent(new CustomEvent('pb:hidePopout'));
        lockToolbarUI(true);
        restoreSelection(editorEl());
        let url = prompt('Insert URL (https://...)');
        lockToolbarUI(false);
        if (!url) return;
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        applyExec('createLink', url);
      });

      (()=>{ const btn=document.getElementById('btn-image'); if(!btn) return;
        const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.className='hidden';
        btn.parentNode.appendChild(input);
        btn.addEventListener('click', ()=>{
          window.dispatchEvent(new CustomEvent('pb:hidePopout'));
          lockToolbarUI(true);
          input.click();
        });
        input.addEventListener('change', (e)=>{
          lockToolbarUI(false);
          const f=e.target.files?.[0]; if(!f) return;
          const rd=new FileReader();
          rd.onload=()=>{
            const ed=editorEl(); restoreSelection(ed);
            const img=document.createElement('img'); img.src=rd.result; img.alt=f.name; img.style.maxWidth='100%'; img.style.borderRadius='8px';
            const sel=window.getSelection(); const range=sel&&sel.rangeCount?sel.getRangeAt(0):null;
            if(range){ range.collapse(true); range.insertNode(img); range.setStartAfter(img); range.setEndAfter(img); sel.removeAllRanges(); sel.addRange(range); }
            else { ed.appendChild(img); placeCaretAtEnd(ed); }
            ed.focus(); saveSelection(ed); e.target.value='';
          };
          rd.readAsDataURL(f);
        });
      })();
    }

    function hidePopout(){ pbPopout.classList.add('hidden'); pbPopout.innerHTML=''; }

    window.addEventListener('pb:hidePopout', hidePopout);

    document.querySelectorAll('.pb-group')?.forEach(g=>{
      g.addEventListener('click', (e)=>{ e.stopPropagation(); showPopoutFor(e.currentTarget, g.dataset.panel); });
    });

    document.addEventListener('click', (e)=>{
      if (!pbPopout.contains(e.target) && !e.target.closest('.pb-group')) hidePopout();
    });

    // Calendar
    datePickerBtn?.addEventListener('click', () => calendarModalOverlay.classList.remove('hidden'));

    // Save
    saveBtn?.addEventListener('click', saveEntry);

    // Back nav
    backBtn?.addEventListener('click', () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'journal-parent.html';
    });

    // Font palette events
    fontPaletteOverlay?.addEventListener('click', (e)=>{ if (e.target === fontPaletteOverlay) closeFontPalette(); });
    fontSearchInput?.addEventListener('input', () => renderFontList(fontSearchInput.value));

    // Close palette with ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFontPalette();
    });
  }

  // --- SAVE & DATE UI ---
  function saveEntry() {
    const title = document.getElementById('journal-title-input').value;
    const body  = document.getElementById('journal-body-editor').innerHTML;
    if (!title.trim() && !body.trim()) { alert("Entry is empty!"); return; }
    const dateKey = toDateKey(selectedDate);
    const all = getJournalEntries();
    all[dateKey] = { title, body, date: selectedDate.toISOString() };
    saveJournalEntries(all);
    alert(`Entry for ${selectedDate.toLocaleDateString()} saved!`);
  }

  function updateDatePickerDisplay() {
    const display = document.getElementById('date-picker-display');
    if (!display) return;
    const today = new Date();
    if (toDateKey(selectedDate) === toDateKey(today)) {
      display.textContent = `Today, ${today.toLocaleDateString('en-US',{month:'long', day:'numeric'})}`;
    } else {
      display.textContent = selectedDate.toLocaleDateString('en-US',{weekday:'long', year:'numeric', month:'long', day:'numeric'});
    }
  }

  function initializeCalendar() {
    if (calendarInstance) return;
    calendarInstance = flatpickr(calendarContainer, {
      inline: true,
      defaultDate: selectedDate,
      onChange: (selectedDates) => {
        selectedDate = new Date(selectedDates[0]);
        updateDatePickerDisplay();
        calendarModalOverlay.classList.add('hidden');
      }
    });
  }

  calendarModalOverlay?.addEventListener('click', (e) => {
    if (e.target === calendarModalOverlay) calendarModalOverlay.classList.add('hidden');
  });

  // INIT
  renderEditor();
  initializeCalendar();
});
