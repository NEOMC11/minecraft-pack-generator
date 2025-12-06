const canvas = document.getElementById('fondo');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.speedY = (Math.random() - 0.5) * 0.8;
    this.opacity = Math.random() * 0.4 + 0.4;
    this.color = Math.random() < 0.33 ? '#6ee7b7' : Math.random() < 0.66 ? '#60a5fa' : '#a78bfa';
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function initParticles() {
  particles = [];
  const particleCount = Math.min(window.innerWidth / 10, 150);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

const sections = document.querySelectorAll('section');
const contentBtn = document.getElementById('contentBtn');
const manifestBtn = document.getElementById('manifestBtn');
const splashBtn = document.getElementById('splashBtn');

function showSection(sectionId) {
  sections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });
  const targetSection = document.getElementById(sectionId);
  targetSection.style.display = 'flex';
  setTimeout(() => {
    targetSection.classList.add('active');
  }, 10);
}

function showMenu() {
  showSection('menu');
}

contentBtn.addEventListener('click', () => showSection('contentUploader'));
manifestBtn.addEventListener('click', () => showSection('manifestUploader'));
splashBtn.addEventListener('click', () => showSection('splashUploader'));

function addFileCard(displayElement, title, filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const card = document.createElement('div');
  card.className = 'file-card';
  card.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <svg xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <div>
        <h3>${title}</h3>
        <p>${filename}</p>
      </div>
    </div>
    <a href="${url}" download="${filename}">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Descargar</span>
    </a>
  `;
  displayElement.appendChild(card);
}

document.getElementById('carpeta').addEventListener('change', function() {
  const lista = document.getElementById('listaArchivos');
  lista.innerHTML = '';
  const archivos = this.files;
  if (!archivos.length) {
    lista.innerHTML = '<li>⚠️ No se seleccionaron archivos</li>';
    return;
  }
  const maxDisplay = 20;
  const total = archivos.length;
  for (let i = 0; i < Math.min(maxDisplay, total); i++) {
    const li = document.createElement('li');
    li.textContent = archivos[i].webkitRelativePath || archivos[i].name;
    lista.appendChild(li);
  }
  if (total > maxDisplay) {
    const li = document.createElement('li');
    li.textContent = `... y ${total - maxDisplay} archivos más`;
    li.style.fontWeight = 'bold';
    lista.appendChild(li);
  }
});

function generarContents() {
  const archivos = document.getElementById('carpeta').files;
  const error = document.getElementById('errorContents');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const fileDisplay = document.getElementById('fileDisplay');
  
  error.style.display = 'none';
  fileDisplay.innerHTML = '';
  
  if (!archivos.length) {
    error.textContent = '⚠️ Sube una carpeta primero.';
    error.style.display = 'block';
    return;
  }

  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';
  progressBar.textContent = '0%';

  const data = { content: [] };
  const batchSize = 100;
  let processed = 0;

  function processBatch(startIdx) {
    const endIdx = Math.min(startIdx + batchSize, archivos.length);
    
    for (let i = startIdx; i < endIdx; i++) {
      const ruta = archivos[i].webkitRelativePath.split('/').slice(1).join('/');
      if (ruta) {
        data.content.push({ path: ruta });
      }
      processed++;
    }

    const porcentaje = Math.round((processed / archivos.length) * 100);
    progressBar.style.width = `${porcentaje}%`;
    progressBar.textContent = `${porcentaje}%`;

    if (endIdx < archivos.length) {
      setTimeout(() => processBatch(endIdx), 0);
    } else {
      addFileCard(
        fileDisplay,
        `Generated Contents (${archivos.length} files)`,
        'contents.json',
        JSON.stringify(data, null, 2),
        'application/json'
      );
      progressBar.textContent = 'Listo';
    }
  }

  processBatch(0);
}

document.getElementById('manifestFolder').addEventListener('change', function() {
  const lista = document.getElementById('listaArchivosManifest');
  lista.innerHTML = '';
  const archivos = this.files;
  if (!archivos.length) {
    lista.innerHTML = '<li>⚠️ No se seleccionaron archivos</li>';
    return;
  }
  const maxDisplay = 20;
  const total = archivos.length;
  for (let i = 0; i < Math.min(maxDisplay, total); i++) {
    const li = document.createElement('li');
    li.textContent = archivos[i].webkitRelativePath || archivos[i].name;
    lista.appendChild(li);
  }
  if (total > maxDisplay) {
    const li = document.createElement('li');
    li.textContent = `... y ${total - maxDisplay} archivos más`;
    li.style.fontWeight = 'bold';
    lista.appendChild(li);
  }
});

function generarManifest() {
  const archivos = document.getElementById('manifestFolder').files;
  const nombre = document.getElementById('nombre').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const versionStr = document.getElementById('version').value.trim();
  const minVersionStr = document.getElementById('minVersion').value.trim();
  const tipo = document.getElementById('tipo').value;
  const error = document.getElementById('errorManifest');
  const manifestDisplay = document.getElementById('manifestDisplay');
  
  error.style.display = 'none';
  manifestDisplay.innerHTML = '';

  if (!archivos.length) {
    error.textContent = '⚠️ Sube una carpeta primero.';
    error.style.display = 'block';
    return;
  }
  if (!nombre || !descripcion || !versionStr || !minVersionStr) {
    error.textContent = '⚠️ Completa todos los campos requeridos (*).';
    error.style.display = 'block';
    return;
  }

  const versionParts = versionStr.split('.').map(Number);
  const minVersionParts = minVersionStr.split('.').map(Number);
  
  if (versionParts.length !== 3 || versionParts.some(isNaN)) {
    error.textContent = '⚠️ La versión debe tener formato X.Y.Z (ej: 1.0.0)';
    error.style.display = 'block';
    return;
  }
  
  if (minVersionParts.length !== 3 || minVersionParts.some(isNaN)) {
    error.textContent = '⚠️ La versión mínima debe tener formato X.Y.Z (ej: 1.21.0)';
    error.style.display = 'block';
    return;
  }

  const headerUUID = generateUUID();
  const moduleUUID = generateUUID();

  const manifest = {
    format_version: 2,
    header: {
      name: nombre,
      description: descripcion,
      uuid: headerUUID,
      version: versionParts,
      min_engine_version: minVersionParts
    },
    modules: [
      {
        type: tipo,
        uuid: moduleUUID,
        version: versionParts
      }
    ]
  };

  addFileCard(
    manifestDisplay,
    'Generated Manifest File',
    'manifest.json',
    JSON.stringify(manifest, null, 2),
    'application/json'
  );
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generarSplashes() {
  const splashText = document.getElementById('splashText').value.trim();
  const error = document.getElementById('errorSplashes');
  const splashDisplay = document.getElementById('splashDisplay');
  
  error.style.display = 'none';
  splashDisplay.innerHTML = '';

  if (!splashText) {
    error.textContent = '⚠️ Ingresa al menos un splash.';
    error.style.display = 'block';
    return;
  }

  const splashes = splashText
    .split(',')
    .map(splash => splash.trim())
    .filter(splash => splash !== '');

  if (splashes.length === 0) {
    error.textContent = '⚠️ Ingresa al menos un splash válido.';
    error.style.display = 'block';
    return;
  }

  const splashesJsonData = {
    splashes: splashes,
    conditional: [
      {
        requires: { trialMode: true },
        splashes: splashes
      }
    ]
  };

  addFileCard(
    splashDisplay,
    'Generated Splashes JSON',
    'splashes.json',
    JSON.stringify(splashesJsonData, null, 2),
    'application/json'
  );
}