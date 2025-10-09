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

  // --- HELPERS ---
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

  function lockToolbarUI(lock = true) {
    if (lock) appContainer.classList.add('ui-locked');
    else appContainer.classList.remove('ui-locked');
  }

  function openFontPalette() {
    window.dispatchEvent(new CustomEvent('pb:hidePopout'));
    const palette = document.getElementById('font-palette-overlay');
    const input = document.getElementById('font-search-input');
    if (!palette || !input) return;
    lockToolbarUI(true);
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
    setTimeout(() => {
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

  // GANTI FUNGSI LAMA DENGAN INI
// Ganti fungsi lama dengan versi yang lebih pintar ini
function openFontSizePrompt() {
    window.dispatchEvent(new CustomEvent('pb:hidePopout'));
    
    const modal = document.getElementById('fontsize-modal-overlay');
    const input = document.getElementById('fontsize-input');
    
    if (!modal || !input) return;

    // SEBELUM: input.value = '16';
    // SESUDAH:
    input.value = getCurrentFontSize(); // Ambil ukuran font saat ini

    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 50);
}
  
  function hidePopout() {
    const pbPopout = document.getElementById('pb-popout');
    if (!pbPopout) return;
    pbPopout.classList.add('hidden');
    pbPopout.innerHTML = '';
    pbPopout.removeAttribute('data-current-panel');
  }
  
  function showPopoutFor(btn, type, ICON) {
    let content = '';
    
    if (type === 'text') {
      content = `<button class="btn" data-cmd="bold" title="Bold">${ICON.bold}</button><button class="btn" data-cmd="italic" title="Italic">${ICON.italic}</button><button class="btn" data-cmd="underline" title="Underline">${ICON.underline}</button>`;
    }
    if (type === 'font') {
      content = `<button class="btn" id="btn-font" title="Font">${ICON.font}</button><button class="btn" id="btn-fontsize" title="Font size">${ICON.fontSize}</button><div class="btn slot" title="Text color">${ICON.textColor}<input id="color-text" type="color" value="#374151"></div><button class="btn" id="btn-highlight" title="Highlight">${ICON.highlight}</button>`;
    }
    if (type === 'insert') {
      content = `<button class="btn" id="btn-link" title="Insert link">${ICON.link}</button><button class="btn" id="btn-image" title="Insert image">${ICON.image}</button>`;
    }
    if (type === 'paragraph') {
      content = `
        <button class="btn" data-align="left"   title="Align left">${ICON.alignLeft}</button>
        <button class="btn" data-align="center" title="Align center">${ICON.alignCenter}</button>
        <button class="btn" data-align="right"  title="Align right">${ICON.alignRight}</button>
        <button class="btn" data-align="justify" title="Justify">${ICON.alignJustify}</button>
        <button class="btn" data-list="ul"      title="Bulleted list">${ICON.bullets}</button>
        <button class="btn" id="btn-checklist"  title="Checklist">${ICON.checklist}</button>
      `;
    }

    const pbPopout = document.getElementById('pb-popout');
    pbPopout.innerHTML = `<div class="flex flex-col gap-1.5">${content}</div>`;
    pbPopout.dataset.currentPanel = type;
    pbPopout.classList.remove('hidden');

    const r = btn.getBoundingClientRect();
    const a = appContainer.getBoundingClientRect();
    const w = pbPopout.offsetWidth;
    const h = pbPopout.offsetHeight;
    const btnCenterY = r.top + r.height / 2;
    let top = btnCenterY - h / 2 - a.top;
    const left = (r.left - a.left) - w - 12;
    const minTop = 8;
    const maxTop = (a.height - h - 8);
    if (top < minTop) top = minTop;
    if (top > maxTop) top = maxTop;
    pbPopout.style.top = `${top}px`;
    pbPopout.style.left = `${left}px`;

    pbPopout.querySelectorAll('.btn[data-align]').forEach(b => {
      b.addEventListener('click', () => {
        const v = b.dataset.align;
        if (v === 'left') applyExec('justifyLeft');
        if (v === 'center') applyExec('justifyCenter');
        if (v === 'right') applyExec('justifyRight');
        if (v === 'justify') applyExec('justifyFull');
      });
    });
    pbPopout.querySelectorAll('.btn[data-cmd]').forEach(b => {
      b.addEventListener('click', () => { applyExec(b.dataset.cmd); });
    });
    pbPopout.querySelectorAll('.btn[data-list]').forEach(b => {
      b.addEventListener('click', () => { if (b.dataset.list === 'ul') applyExec('insertUnorderedList'); });
    });
    document.getElementById('btn-checklist')?.addEventListener('click', () => {
      const ed = editorEl(); restoreSelection(ed);
      const sel = window.getSelection(); if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const block = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentNode);
      let ul = block.closest && block.closest('ul.todo');
      if (!ul) {
        ul = document.createElement('ul'); ul.className = 'todo'; ul.style.listStyle = 'none'; ul.style.paddingLeft = '0';
        const li = document.createElement('li'); li.style.display = 'flex'; li.style.alignItems = 'center';
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'mr-2';
        li.appendChild(cb); li.appendChild(document.createTextNode(range.toString() || ''));
        if (block.parentNode && block.parentNode.contains(block)) { block.parentNode.insertBefore(ul, block); ul.appendChild(li); block.remove(); }
        else { ul.appendChild(li); ed.appendChild(ul); }
      } else {
        const parent = ul.parentNode; if (parent) { const p = document.createElement('p'); p.textContent = ul.innerText.replace(/\n/g, ' '); parent.insertBefore(p, ul); ul.remove(); }
      }
      ed.focus(); saveSelection(ed);
    });
    document.getElementById('btn-font')?.addEventListener('click', openFontPalette);
    document.getElementById('btn-fontsize')?.addEventListener('click', openFontSizePrompt);
    document.getElementById('color-text')?.addEventListener('input', e => { applyExec('foreColor', e.target.value); });
    document.getElementById('btn-highlight')?.addEventListener('click', () => {
      lockToolbarUI(true);
      const col = prompt('Highlight color (hex/rgb)', '#fff59d');
      lockToolbarUI(false);
      if (!col) return;
      try { applyExec('hiliteColor', col); } catch { };
    });
    document.getElementById('btn-link')?.addEventListener('click', () => {
      restoreSelection(editorEl());
      let url = prompt('Insert URL (https://...)');
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      applyExec('createLink', url);
    });
    (() => {
      const btn = document.getElementById('btn-image'); if (!btn) return;
      const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.className = 'hidden';
      btn.parentNode.appendChild(input);
      btn.addEventListener('click', () => { input.click(); });
      input.addEventListener('change', (e) => {
        lockToolbarUI(false);
        if (!e.target.files || e.target.files.length === 0) {
          return;
        }
        const f = e.target.files[0];
        const rd = new FileReader();
        rd.onload = () => {
          const ed = editorEl(); restoreSelection(ed);
          const img = document.createElement('img'); img.src = rd.result; img.alt = f.name; img.style.maxWidth = '100%'; img.style.borderRadius = '8px';
          const sel = window.getSelection(); const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
          if (range) { range.collapse(true); range.insertNode(img); range.setStartAfter(img); range.setEndAfter(img); sel.removeAllRanges(); sel.addRange(range); }
          else { ed.appendChild(img); placeCaretAtEnd(ed); }
          ed.focus(); saveSelection(ed); e.target.value = '';
        };
        rd.readAsDataURL(f);
      });
    })();
  }

  function isSelectionOnText() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return false;
    }

    // Kasus 1: Pengguna sedang menyeleksi/mem-blok teks
    // Kita cek apakah hasil seleksinya (setelah diubah jadi string) punya isi.
    if (!selection.isCollapsed) {
        return selection.toString().trim().length > 0;
    }

    // Kasus 2: Pengguna hanya mengklik (posisi kursor)
    // Kita cek node tempat kursor berada.
    const anchorNode = selection.anchorNode;
    if (!anchorNode) {
        return false;
    }

    // Cek apakah node tersebut punya konten teks yang berarti.
    return anchorNode.textContent.trim().length > 0;
}
  function getCurrentFontSize() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '16'; // Default

    let element = selection.anchorNode;
    // Jika node adalah teks, ambil elemen induknya
    if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
    }

    // Pastikan elemen berada di dalam editor kita
    if (!editorEl() || !editorEl().contains(element)) {
        return '16';
    }

    // Ambil style font-size yang sedang diterapkan
    const style = window.getComputedStyle(element);
    const fontSize = style.getPropertyValue('font-size');
    
    // Ambil angkanya saja dari "66px" -> 66
    return parseInt(fontSize, 10) || '16';
}
  function attachEditorListeners(ICON) {
    const ed = editorEl();
    const datePickerBtn = document.getElementById('date-picker-btn');
    const saveBtn = document.getElementById('save-btn');
    const pbToggle = document.getElementById('pb-toggle');
    const pbRail = document.getElementById('pb-rail');
    const pbClose = document.getElementById('pb-close');

    try { document.execCommand('styleWithCSS', false, true); } catch (_) { }
    ['keyup', 'mouseup', 'input', 'focus'].forEach(ev => ed.addEventListener(ev, () => saveSelection(ed)));

    function openPbRail() {
      pbRail.classList.add('open');
      pbRail.style.opacity = '1';
      pbRail.style.pointerEvents = 'auto';
      pbRail.style.transform = 'translateY(-50%) translateX(0)';
      pbToggle.classList.add('hidden');
    }
    function closePbRail() {
      pbRail.classList.remove('open');
      pbRail.style.opacity = '0';
      pbRail.style.pointerEvents = 'none';
      pbRail.style.transform = 'translateY(-50%) translateX(1rem)';
      pbToggle.classList.remove('hidden');
      hidePopout();
    }

    pbToggle?.addEventListener('click', (e) => { e.stopPropagation(); openPbRail(); });
    pbClose?.addEventListener('click', (e) => { e.stopPropagation(); closePbRail(); });
    
    document.querySelectorAll('.pb-group').forEach(g => {
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        const panelType = g.dataset.panel;
        const popout = document.getElementById('pb-popout');
        if (!popout.classList.contains('hidden') && popout.dataset.currentPanel === panelType) {
          hidePopout();
        } else {
          showPopoutFor(e.currentTarget, panelType, ICON);
        }
      });
    });

// SESUDAH
document.addEventListener('click', (e) => {
  const popout = document.getElementById('pb-popout');
  const rail = document.getElementById('pb-rail');
  const editor = editorEl(); // Dapatkan referensi ke editor

  if (popout && !popout.classList.contains('hidden') && !popout.contains(e.target) && !e.target.closest('.pb-group')) {
    hidePopout();
  }
  
  // Logika untuk menutup seluruh rail
  if (
    rail &&
    rail.classList.contains('open') &&
    !rail.contains(e.target) &&
    !popout.contains(e.target) &&
    !editor.contains(e.target) && // <-- KONDISI BARU: Pastikan klik bukan di dalam editor
    e.target !== pbToggle
  ) {
    closePbRail();
  }
});

    window.addEventListener('pb:hidePopout', hidePopout);
    
    datePickerBtn?.addEventListener('click', () => calendarModalOverlay.classList.remove('hidden'));
    saveBtn?.addEventListener('click', saveEntry);
    backBtn?.addEventListener('click', () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'journal-parent.html';
    });
    
    const fontPaletteOverlay = document.getElementById('font-palette-overlay');
    const fontSearchInput = document.getElementById('font-search-input');
    fontPaletteOverlay?.addEventListener('click', (e)=>{ if (e.target === fontPaletteOverlay) closeFontPalette(); });
    fontSearchInput?.addEventListener('input', () => renderFontList(fontSearchInput.value));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const popout = document.getElementById('pb-popout');
        if (fontPaletteOverlay && !fontPaletteOverlay.classList.contains('hidden')) {
            closeFontPalette();
        } else if (popout && !popout.classList.contains('hidden')) {
            hidePopout();
        }
      }
    });
  }
  
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
        plus:  `<img src="icons/plus.png" alt="Open" class="w-6 h-6">`,
        close: `<img src="icons/close.png" alt="Close" class="w-5 h-5">`,
        textGrp:   `<img src="icons/text-group.png" alt="Text" class="w-5 h-5">`,
        fontGrp:   `<img src="icons/font-size.png" alt="Font" class="w-5 h-5">`,
        insertGrp: `<img src="icons/insert-group.png" alt="Insert" class="w-5 h-5">`,
        paraGrp:   `<img src="icons/paragraph-group.png" alt="Paragraph" class="w-5 h-5">`,
        bold:      `<img src="icons/bold.png" alt="Bold" class="w-5 h-5">`,
        italic:    `<img src="icons/italic.png" alt="Italic" class="w-5 h-5">`,
        underline: `<img src="icons/underline.png" alt="Underline" class="w-5 h-5">`,
        font:      `<img src="icons/font.png" alt="Font Family" class="w-5 h-5">`,
        fontSize:  `<img src="icons/font-size.png" alt="Font Size" class="w-5 h-5">`,
        textColor: `<img src="icons/textcolor.png" alt="Text Color" class="w-5 h-5">`,
        highlight: `<img src="icons/highlight.png" alt="Highlight" class="w-5 h-5">`,
        link:      `<img src="icons/link.png" alt="Link" class="w-5 h-5">`,
        image:     `<img src="icons/img.png" alt="Image" class="w-5 h-5">`,
        alignLeft:   `<img src="icons/align-left.png" alt="Align Left" class="w-5 h-5">`,
        alignJustify: `<img src="icons/justify.png" alt="Justify" class="w-5 h-5">`,
        alignRight:   `<img src="icons/align-right.png" alt="Align Right" class="w-5 h-5">`,
        alignCenter: `<img src="icons/align-center.png" alt="Align Center" class="w-5 h-5">`,
        bullets:     `<img src="icons/bullets.png" alt="Bullets" class="w-5 h-5">`,
        checklist:   `<img src="icons/check-list.png" alt="Checklist" class="w-5 h-5">`
    };

    const ui = `
      <button id="pb-toggle"
        class="pb-hide-initial absolute top-1/2 -translate-y-1/2 right-3 z-50 w-10 h-10 flex items-center justify-center
               bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-lg
               text-gray-700 hover:shadow-xl"
        aria-expanded="false" aria-controls="pb-rail" title="Open toolbar" style="opacity:0; pointer-events:none;">
        ${ICON.plus}
      </button>

      <div id="pb-rail"
           class="absolute top-1/2 -translate-y-1/2 right-3 z-40 w-12 max-h-[72vh] overflow-y-auto
                  bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-1.5
                  opacity-0 pointer-events-none translate-x-4">
        <div class="flex flex-col gap-1">
          <button class="pb-btn" id="pb-close" title="Close Toolbar">
            ${ICON.close}
          </button>
          <div class="h-px bg-gray-200/80 my-1"></div>
          <button class="pb-btn pb-group" data-panel="text"    title="Text">${ICON.textGrp}</button>
          <button class="pb-btn pb-group" data-panel="font"    title="Font">${ICON.fontGrp}</button>
          <button class="pb-btn pb-group" data-panel="insert"  title="Insert">${ICON.insertGrp}</button>
          <button class="pb-btn pb-group" data-panel="paragraph"title="Paragraph">${ICON.paraGrp}</button>
        </div>
      </div>

      <div id="pb-popout" class="hidden absolute z-50"></div>

      <div id="font-palette-overlay"
           class="hidden absolute inset-0 z-[60] bg-gray-900/10 backdrop-blur-sm flex justify-center items-start pt-20
                  transition-opacity opacity-0 pointer-events-none">
        <div class="w-full max-w-xs bg-white rounded-xl shadow-2xl overflow-hidden">
          <input type="text" id="font-search-input" class="w-full p-4 border-b border-gray-200 focus:outline-none" placeholder="Search fonts...">
          <div id="font-list" class="max-h-60 overflow-y-auto"></div>
        </div>
      </div>
    `;

    document.querySelectorAll('#pb-toggle,#pb-close,#pb-rail,#pb-popout,#font-palette-overlay').forEach(el => el.remove());
    appContainer.insertAdjacentHTML('beforeend', ui);

    const styleId = 'pb-rail-styles';
    if (!document.getElementById(styleId)) {
      const st = document.createElement('style');
      st.id = styleId;
      st.textContent = `
        .pb-preload * { transition:none !important; animation:none !important; }
        #pb-rail, .pb-btn, #pb-toggle { transition:none; }
        .pb-ready #pb-rail.open { transition: opacity .18s ease, transform .18s ease; }
        .pb-ready .pb-btn { transition: transform .08s ease, background-color .12s ease; }
        .pb-ready #pb-toggle { transition: opacity .15s ease, transform .15s ease, box-shadow .15s ease; }
        .pb-btn{ width:42px;height:42px; display:flex;align-items:center;justify-content:center; border-radius:10px; border:1px solid transparent; background:transparent; cursor:pointer; color:#374151; }
        .pb-ready .pb-btn:hover{ background:#f3f4f6 }
        .pb-ready .pb-btn:active{ transform:scale(.96) }
        #pb-popout{ background:rgba(255,255,255,.98); border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 12px 28px rgba(0,0,0,.12); padding:6px; display:flex; flex-direction:column; gap:6px; width:max-content; max-width:220px; }
        #pb-popout .btn{ width:40px;height:40px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:transparent; border:1px solid transparent; color:#374151; cursor:pointer; }
        .pb-ready #pb-popout .btn:hover{ background:#f3f4f6 }
        .pb-ready #pb-popout .btn:active{ transform:scale(.96) }
        #pb-popout .slot{ display:flex; align-items:center; gap:6px; }
        #pb-popout input[type="color"]{ width:28px; height:28px; border:1px solid #d1d5db; border-radius:6px; cursor:pointer; }
        .ui-locked #pb-toggle, .ui-locked #pb-rail, .ui-locked #pb-popout { pointer-events: none !important; opacity:.35; filter:grayscale(.2); }
        #pb-rail, #pb-popout, #font-list { -ms-overflow-style:none; scrollbar-width:none; }
        #pb-rail::-webkit-scrollbar, #pb-popout::-webkit-scrollbar, #font-list::-webkit-scrollbar { display:none; width:0; height:0; }
      `;
      document.head.appendChild(st);
    }

    appContainer.classList.add('pb-preload');
    const pbToggle = appContainer.querySelector('#pb-toggle');
    pbToggle.style.opacity = '1';
    pbToggle.style.pointerEvents = 'auto';

    requestAnimationFrame(() => {
      appContainer.classList.remove('pb-preload');
      setTimeout(() => {
        appContainer.classList.add('pb-ready');
      }, 0);
    });

    attachEditorListeners(ICON);
    updateDatePickerDisplay();
  }

  function saveEntry() {
    const title = document.getElementById('journal-title-input').value;
    const body = document.getElementById('journal-body-editor').innerHTML;
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
      display.textContent = `Today, ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    } else {
      display.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

// --- LOGIKA UNTUK FONT SIZE MODAL ---
const fontSizeModal = document.getElementById('fontsize-modal-overlay');
const fontSizeInput = document.getElementById('fontsize-input');
const applyBtn = document.getElementById('apply-fontsize');
const cancelBtn = document.getElementById('cancel-fontsize');
const incrementBtn = document.getElementById('increment-fontsize');
const decrementBtn = document.getElementById('decrement-fontsize');

function closeFontSizeModal() {
    if (fontSizeModal) fontSizeModal.classList.add('hidden');
}

incrementBtn?.addEventListener('click', () => {
    fontSizeInput.value = parseInt(fontSizeInput.value, 10) + 1;
});

decrementBtn?.addEventListener('click', () => {
    const currentValue = parseInt(fontSizeInput.value, 10);
    if (currentValue > 1) {
        fontSizeInput.value = currentValue - 1;
    }
});

applyBtn?.addEventListener('click', () => {
    const size = fontSizeInput.value;
    if (size && !isNaN(size)) {
        wrapInline({ fontSize: `${size}px` });
    }
    closeFontSizeModal();
});

cancelBtn?.addEventListener('click', closeFontSizeModal);
fontSizeModal?.addEventListener('click', (e) => {
    if (e.target === fontSizeModal) {
        closeFontSizeModal();
    }
});
// --- END OF FONT SIZE MODAL LOGIC ---

// --- INIT ---
renderEditor();
initializeCalendar();
});