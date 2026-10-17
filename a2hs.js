// Add-to-home-screen button for ting-trips (index + every trip page).
// Index: uses the .a2hs button in its markup. Trip pages: a compact .a2hs button is inserted into
// every rendered header (.hd .kick), before the 緊急 button. Hidden when already running as the app.
// v6: icon path relative to the page folder (GitHub Pages serves the site under /Travel-itinerary/).
(function(){
  var ua=navigator.userAgent||'';
  var standalone=(window.matchMedia&&(matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches))||navigator.standalone===true;
  // Already running as the home-screen app: hide every .a2hs button (the index has one in its markup) and stop.
  if(standalone){var hs=document.createElement('style');hs.textContent='.a2hs{display:none!important}';document.head.appendChild(hs);return}
  var isIOS=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
  var isAndroid=/Android/.test(ua);
  var isLine=/\bLine\//i.test(ua);
  var isInApp=isLine||/FBAN|FBAV|Instagram|MicroMessenger|WhatsApp/i.test(ua);
  var deferred=null;
  // App name comes from the page (index: Ting, trip pages: Ting + city); trip pages open on that trip.
  var mt=document.querySelector('meta[name="apple-mobile-web-app-title"]');
  var APP=(mt&&mt.content)||'Ting';
  // The index carries its own .a2hs-pill button in markup; trip pages get theirs injected.
  var isTrip=function(){return !document.querySelector('.a2hs-pill')};
  var root=document.documentElement;
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};

  var css=[
  '.a2hs{display:none;flex:0 0 auto;align-items:center;justify-content:center;gap:5px;border:1.5px solid var(--signal,#FFC72C);background:none;color:var(--signal,#FFC72C);font-family:inherit;font-weight:700;cursor:pointer;white-space:nowrap;letter-spacing:0}',
  '.a2hs-on .a2hs{display:inline-flex}',
  '.a2hs svg{flex:0 0 auto}',
  '.a2hs-pill{min-height:34px;padding:0 12px;border-radius:999px;font-size:13.5px}.a2hs-pill svg{width:16px;height:16px}',
  '.a2hs-sm{min-height:32px;padding:0 8px;border-radius:8px;font-size:13px;margin-left:auto}.a2hs-sm svg{width:14px;height:14px}',
  '.a2hs-abs{position:absolute;top:12px;right:16px}',
  // Trip-page headers: keep the date line on one row; the buttons move to a second row when they do not fit.
  '.a2hs-on .hd .kick{flex-wrap:wrap;row-gap:6px}.a2hs-on .hd .kick>span{white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}',
  '.a2hs:focus-visible,.a2hs-sheet button:focus-visible,.a2hs-sheet a:focus-visible{outline:3px solid var(--signal,#FFC72C);outline-offset:2px}',
  'dialog.a2hs-sheet{margin:auto auto 0;width:100%;max-width:640px;border:0;border-radius:20px 20px 0 0;padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px));background:var(--card,#fff);color:var(--ink,#0F1B26);font-family:inherit}',
  'dialog.a2hs-sheet::backdrop{background:rgba(7,16,26,.55)}',
  '.a2hs-sh{display:flex;align-items:center;gap:12px;margin-bottom:14px}.a2hs-sh img{width:52px;height:52px;border-radius:12px}',
  '.a2hs-sh b{display:block;font-size:18px;line-height:1.35}.a2hs-sh small{font-size:13px;color:var(--ink3,#56636F)}',
  '.a2hs-steps{list-style:none;margin:0 0 16px;padding:0;display:flex;flex-direction:column;gap:10px}',
  '.a2hs-steps li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;align-items:start;font-size:15px;line-height:1.5}',
  '.a2hs-steps .n{width:28px;height:28px;border-radius:50%;background:var(--board,#0F1B26);color:var(--signal,#FFC72C);font-family:var(--num,inherit);font-size:17px;font-weight:700;display:flex;align-items:center;justify-content:center}',
  '.a2hs-steps svg{width:18px;height:18px;vertical-align:-3px;margin:0 2px}',
  '.a2hs-note{margin:0 0 14px;font-size:13.5px;line-height:1.5;color:var(--ink2,#3E4C59);background:var(--bg,#EEF1F4);border-radius:10px;padding:8px 12px}',
  '.a2hs-btns{display:flex;gap:8px}',
  '.a2hs-btns a,.a2hs-btns button{flex:1;min-height:46px;border-radius:12px;font:inherit;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer}',
  '.a2hs-btns .pri{background:var(--signal,#FFC72C);color:var(--on-signal,#0F1B26);border:0}',
  '.a2hs-btns .sec{background:none;color:var(--ink,#0F1B26);border:1.5px solid var(--line2,#C6CFD8)}'
  ].join('');
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="分享"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  var PLUS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-label="加入"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var DOTS='<svg viewBox="0 0 24 24" fill="currentColor" aria-label="選單"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';

  var sheet=null,sub,body,btns;
  function build(){
    if(sheet)return;
    sheet=document.createElement('dialog');sheet.className='a2hs-sheet';sheet.setAttribute('aria-labelledby','a2hsTitle');
    sheet.innerHTML='<div class="a2hs-sh"><img src="../icons/icon-192.png" alt=""><div><b id="a2hsTitle">把 '+esc(APP)+' 加到主畫面</b><small></small></div></div><div class="a2hs-body"></div><div class="a2hs-btns"></div>';
    document.body.appendChild(sheet);
    sub=sheet.querySelector('small');body=sheet.querySelector('.a2hs-body');btns=sheet.querySelector('.a2hs-btns');
    sheet.addEventListener('click',function(e){if(e.target===sheet||e.target.closest('[data-a2hs-close]'))closeSheet()});
  }
  function closeSheet(){if(sheet.close)sheet.close();else sheet.removeAttribute('open')}
  function steps(a){return '<ol class="a2hs-steps">'+a.map(function(s,i){return '<li><span class="n">'+(i+1)+'</span><span>'+s+'</span></li>'}).join('')+'</ol>'}
  var CLOSE='<button type="button" class="sec" data-a2hs-close>知道了</button>';
  var AFTER='<p class="a2hs-note">之後點主畫面上的「'+esc(APP)+'」，會以全螢幕 app 模式'+(isTrip()?'直接打開這個行程':'打開行程目錄')+'。</p>';
  function open(kind){
    build();
    if(kind==='inapp'){
      var u=new URL(location.href);u.searchParams.set('openExternalBrowser','1');
      sub.textContent='目前在 App 內建瀏覽器，無法加到主畫面';
      body.innerHTML='<p class="a2hs-note">請先用'+(isIOS?' Safari ':' Chrome ')+'開啟這個頁面，再按一次「加到主畫面」。</p>'+(isLine?'':steps(['點右上角 '+DOTS+' 選單','選「在瀏覽器開啟」']));
      btns.innerHTML=(isLine?'<a class="pri" href="'+esc(u.toString())+'">用'+(isIOS?' Safari ':'瀏覽器')+'開啟</a>':'')+CLOSE;
    }else if(kind==='ios'){
      sub.textContent='iPhone 手動加入，約 10 秒';
      body.innerHTML=steps(['點 Safari 下方的分享按鈕 '+SHARE,'往下滑，選「加入主畫面」 '+PLUS,'名稱保持「'+esc(APP)+'」，點右上角「加入」'])+AFTER;
      btns.innerHTML=CLOSE;
    }else{
      sub.textContent='Android 手動加入';
      body.innerHTML=steps(['點 Chrome 右上角 '+DOTS+' 選單','選「加到主畫面」','依畫面確認加入'])+AFTER;
      btns.innerHTML=CLOSE;
    }
    if(sheet.showModal)sheet.showModal();else sheet.setAttribute('open','');
  }

  function show(){root.classList.add('a2hs-on')}
  function hide(){root.classList.remove('a2hs-on')}
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;show()});
  window.addEventListener('appinstalled',function(){deferred=null;hide()});
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.a2hs');if(!b)return;
    e.preventDefault();e.stopPropagation();
    if(deferred){var d=deferred;deferred=null;d.prompt();if(d.userChoice)d.userChoice.then(function(r){if(r.outcome==='accepted')hide()}).catch(function(){});return}
    open(isInApp?'inapp':isIOS?'ios':'android');
  },true);
  if(isIOS||isAndroid||isInApp)show();

  // Trip pages: headers are re-rendered on every tab change, so keep inserting the button.
  function mk(cls){var b=document.createElement('button');b.type='button';b.className='a2hs a2hs-sm'+(cls||'');b.innerHTML=ICON+'加到主畫面';return b}
  function inject(){
    var hs=document.querySelectorAll('.hd');
    for(var i=0;i<hs.length;i++){
      var h=hs[i];if(h.querySelector('.a2hs'))continue;
      var k=h.querySelector('.kick');
      if(k){var sos=k.querySelector('.sosb');if(sos)k.insertBefore(mk(),sos);else k.appendChild(mk())}
      else{h.style.position='relative';h.appendChild(mk(' a2hs-abs'))}
    }
  }
  function start(){
    inject();
    if(window.MutationObserver)new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
    if(isLine&&!new URLSearchParams(location.search).has('openExternalBrowser'))open('inapp');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
