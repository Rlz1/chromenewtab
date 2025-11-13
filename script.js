const CORRECT_SECRET_KEY = 'vvedite_svoy_sekretny_klyuch'; 
const EXPECTED_USER_AGENT_START = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'; 

const AUTH_KEY = 'ascii_authenticated';
const mainContent = document.getElementById('mainContent');
const authScreen = document.getElementById('authScreen');
const openBgSettingsBtn = document.getElementById('openBgSettingsBtn');
const loginBtn = document.getElementById('loginBtn');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');

if (passwordInput) {
    passwordInput.placeholder = 'Введите секретный ключ';
}

function checkAuthentication() {
  if (sessionStorage.getItem(AUTH_KEY) === 'true') {
    showContent();
  } else {
    showLogin();
  }
}

function showContent() {
  if (mainContent) mainContent.style.display = 'block';
  if (authScreen) authScreen.style.display = 'none';
  if (openBgSettingsBtn) openBgSettingsBtn.style.display = 'block';
  initializeDashboard(); 
}

function showLogin() {
  if (mainContent) mainContent.style.display = 'none';
  if (authScreen) authScreen.style.display = 'block';
  if (openBgSettingsBtn) openBgSettingsBtn.style.display = 'none';
  
  loginBtn.onclick = attemptLogin;
  passwordInput.onkeypress = (e) => {
    if (e.key === 'Enter') attemptLogin();
  };
}

function attemptLogin() {
  const enteredKey = passwordInput.value.trim();
  const currentUserAgent = navigator.userAgent;
  
  if (enteredKey !== CORRECT_SECRET_KEY) {
      loginError.textContent = 'Ошибка: Неверный ключ доступа.';
      loginError.style.display = 'block';
      passwordInput.value = '';
      return;
  }
  
  if (!currentUserAgent.startsWith(EXPECTED_USER_AGENT_START)) {
      loginError.textContent = 'Ошибка: Устройство или браузер не авторизованы.';
      loginError.style.display = 'block';
      passwordInput.value = ''; 
      return;
  }
  
  sessionStorage.setItem(AUTH_KEY, 'true');
  showContent();
  loginError.style.display = 'none';
}

function initializeDashboard() {
  
  function updateTime(){
    const now=new Date();
    const hh=String(now.getHours()).padStart(2,'0');
    const mm=String(now.getMinutes()).padStart(2,'0');
    document.getElementById('time').textContent=hh+':'+mm;
    document.getElementById('date').textContent=now.toLocaleString('ru-RU',{weekday:'long', day:'numeric', month:'long', year:'numeric'});
  }
  updateTime();setInterval(updateTime,10000);

  const greetings=[
    {j:'おはようございます',t:'(Ohayou gozaimasu — доброе утро)'},
    {j:'こんにちは',t:'(Konnichiwa — здравствуйте)'},
    {j:'こんばんは',t:'(Konbanwa — добрый вечер)'},
    {j:'やあ',t:'(Yaa — привет)'},
  ];
  function showGreeting(){
    const g=greetings[Math.floor(Math.random()*greetings.length)];
    document.getElementById('greeting').innerHTML=`<strong>${g.j}</strong> <span class='gtrans'>${g.t}</span>`;
  }
  showGreeting();setInterval(showGreeting,10000);

  const QL_KEY = 'ascii_quicklinks_v1';
  const defaultQuickLinks = [
    { url: "https://mail.google.com", icon: "fa-solid fa-envelope", type: "fa" },
    { url: "https://www.youtube.com", icon: "fa-brands fa-youtube", type: "fa" },
    { url: "https://github.com", icon: "fa-brands fa-github", type: "fa" }
  ];

  function loadQuickLinks() {
    try {
      const stored = localStorage.getItem(QL_KEY);
      return stored ? JSON.parse(stored) : defaultQuickLinks;
    } catch {
      return defaultQuickLinks;
    }
  }

  function saveQuickLinks(links) {
    localStorage.setItem(QL_KEY, JSON.stringify(links));
    renderQuickLinks();
  }

  function getDomainFirstLetter(url) {
    try {
      let hostname = new URL(url).hostname;
      hostname = hostname.replace(/^www\./, ''); 
      return hostname[0].toUpperCase();
    } catch {
      return '...';
    }
  }

  function renderQuickLinks() {
    const links = loadQuickLinks();
    const grid = document.getElementById('quickLinksGrid');
    grid.innerHTML = '';
    
    links.forEach((link, index) => {
      const a = document.createElement('a');
      a.className = 'quick-link-btn';
      a.href = link.url;
      a.target = '_blank';
      a.title = link.url;

      let iconHtml = '';
      if (link.type === 'fa') {
        iconHtml = `<i class="${link.icon}"></i>`;
      } else if (link.type === 'img') {
        iconHtml = `<img src="${link.icon}" alt="icon">`;
      } else if (link.type === 'char') {
        iconHtml = `<span>${link.icon}</span>`;
      }
      
      a.innerHTML = `${iconHtml}<button class="quick-link-remove" data-index="${index}">&times;</button>`;
      grid.appendChild(a);
    });
  }

  document.getElementById('addQuickLinkBtn').onclick = () => {
    let url = document.getElementById('quickLinkUrl').value.trim();
    const icon = document.getElementById('quickLinkIcon').value.trim();

    if (!url) return alert('Введите URL');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let linkType, linkIcon;
    if (!icon) {
      linkType = 'char';
      linkIcon = getDomainFirstLetter(url);
    } else if (icon.includes('.') || icon.startsWith('data:image') || icon.startsWith('http')) {
      linkType = 'img';
      linkIcon = icon;
    } else {
      linkType = 'fa';
      linkIcon = icon;
    }

    const links = loadQuickLinks();
    links.push({ url: url, icon: linkIcon, type: linkType });
    saveQuickLinks(links);

    document.getElementById('quickLinkUrl').value = '';
    document.getElementById('quickLinkIcon').value = '';
  };

  document.getElementById('quickLinksGrid').addEventListener('click', e => {
    if (e.target.classList.contains('quick-link-remove')) {
      e.preventDefault(); 
      e.stopPropagation(); 
      const index = parseInt(e.target.dataset.index, 10);
      const links = loadQuickLinks();
      links.splice(index, 1);
      saveQuickLinks(links);
    }
  });

  renderQuickLinks(); 

  const openBtn = document.getElementById('openBgSettingsBtn');
  const closeBtn = document.getElementById('closeBgModalBtn');
  const modal = document.getElementById('bgModal');
  const backdrop = document.getElementById('modalBackdrop');

  function openModal() {
    modal.style.display = 'block';
    backdrop.style.display = 'block';
  }

  function closeModal() {
    modal.style.display = 'none';
    backdrop.style.display = 'none';
  }

  if (openBtn) openBtn.onclick = openModal;
  if (closeBtn) closeBtn.onclick = closeModal;
  if (backdrop) backdrop.onclick = closeModal;

  const BG_COLOR_KEY = 'ascii_bg_color';
  const BG_IMAGE_KEY = 'ascii_bg_image'; 
  const colorPicker = document.getElementById('bgColor');
  const hexInput = document.getElementById('bgHex');
  const imageUrlInput = document.getElementById('bgImageUrl');
  const fileInput = document.getElementById('bgFileInput');
  const defaultBgColor = '#0f0f0f';

  function loadBackground() {
    const color = localStorage.getItem(BG_COLOR_KEY);
    const imageUrl = localStorage.getItem(BG_IMAGE_KEY); 

    if (imageUrl) {
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      
      if (!imageUrl.startsWith('data:image')) {
        imageUrlInput.value = imageUrl;
      } else {
        imageUrlInput.value = ''; 
      }
    } else {
      document.body.style.backgroundImage = 'none';
      imageUrlInput.value = '';
    }
    
    fileInput.value = ''; 
    const bgColorToApply = color || defaultBgColor;
    document.body.style.backgroundColor = bgColorToApply;
    if (colorPicker) colorPicker.value = bgColorToApply;
    if (hexInput) hexInput.value = bgColorToApply;
  }

  if (colorPicker) colorPicker.oninput = () => { if (hexInput) hexInput.value = colorPicker.value; };
  if (hexInput) hexInput.onchange = () => { try { if (colorPicker) colorPicker.value = hexInput.value; } catch(e) {} };

  const applyBgBtn = document.getElementById('applyBgBtn');
  if (applyBgBtn) applyBgBtn.onclick = () => {
    const color = hexInput.value;
    const imageUrl = imageUrlInput.value.trim();
    const file = fileInput.files[0];
    
    localStorage.setItem(BG_COLOR_KEY, color);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        localStorage.setItem(BG_IMAGE_KEY, e.target.result); 
        loadBackground();
        closeModal();
      }
      reader.readAsDataURL(file);
    } else if (imageUrl) {
      localStorage.setItem(BG_IMAGE_KEY, imageUrl);
      loadBackground();
      closeModal();
    } else {
      localStorage.removeItem(BG_IMAGE_KEY);
      loadBackground();
      closeModal();
    }
  };

  const resetBgBtn = document.getElementById('resetBgBtn');
  if (resetBgBtn) resetBgBtn.onclick = () => {
    localStorage.removeItem(BG_COLOR_KEY);
    localStorage.removeItem(BG_IMAGE_KEY);
    loadBackground();
    closeModal();
  };

  loadBackground(); 

  async function fetchWeather(lat,lon){try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);const d=await r.json();if(d.current_weather){const t=Math.round(d.current_weather.temperature);const c=d.current_weather.weathercode;document.getElementById('wtemp').textContent=t+'°C';document.getElementById('wdesc').textContent=weatherCodeToText(c);document.getElementById('wicon').textContent=weatherCodeToIcon(c);}else{document.getElementById('wdesc').textContent='Нет данных';}}catch{document.getElementById('wdesc').textContent='Ошибка погоды'}}
  function weatherCodeToText(c){const m={0:'Ясно',1:'Преимущ. ясно',2:'Облачно',3:'Пасмурно',45:'Туман',48:'Иней',51:'Лёгкий дождь',53:'Дождь',55:'Сильный дождь',61:'Дождь',71:'Снег',80:'Ливень'};return m[c]||'Переменная погода';}
  function weatherCodeToIcon(c){if(c===0)return'☀️';if(c<=3)return'⛅';if(c>=45&&c<=48)return'🌫️';if(c>=51&&c<=67)return'🌧️';if(c>=71&&c<=77)return'❄️';return'🌤️';}
  if(navigator.geolocation){navigator.geolocation.getCurrentPosition(p=>fetchWeather(p.coords.latitude,p.coords.longitude),()=>fetchWeather(52.37,4.90),{timeout:5000});}else fetchWeather(52.37,4.90);
}

checkAuthentication();