const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 1000;

const imagenInput = document.getElementById('imagen');
const nombreInput = document.getElementById('nombre');
const danzaSelect = document.getElementById('danza');
const otraDanzaInput = document.getElementById('otraDanza');
const btnDescargar = document.getElementById('btnDescargar');

const img = new Image();
const marco = new Image();
marco.src = 'marco.png';

let scale = 1;
let offsetX = 0;
let offsetY = 0;
let imageLoaded = false;

const maxScale = 3;
const minScale = 0.3;

imagenInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

img.onload = function () {
  imageLoaded = true;

  // Centrar imagen
  offsetX = 0;
  offsetY = 0;
  scale = 1;

  drawCanvas();
};

marco.onload = drawCanvas;

nombreInput.addEventListener('input', drawCanvas);
danzaSelect.addEventListener('change', () => {
  otraDanzaInput.style.display = danzaSelect.value === 'otro' ? 'block' : 'none';
  drawCanvas();
});
otraDanzaInput.addEventListener('input', drawCanvas);

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar imagen del usuario detrás del marco
  if (imageLoaded) {
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const x = (canvas.width - imgWidth) / 2 + offsetX;
    const y = (canvas.height - imgHeight) / 2 + offsetY;
    ctx.drawImage(img, x, y, imgWidth, imgHeight);
  }

  // Dibujar marco encima
  ctx.drawImage(marco, 0, 0, canvas.width, canvas.height);

  // Dibujar textos
  ctx.fillStyle = 'white';
  ctx.font = 'bold 34px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const linesNombre = nombreInput.value.trim().split(" ");
  linesNombre.forEach((line, i) => {
    ctx.fillText(line, 30, 850 + i * 30);
  });

  const danza = danzaSelect.value === 'otro' ? otraDanzaInput.value : danzaSelect.value;
  const linesDanza = ['DANZA:', danza];
  linesDanza.forEach((line, i) => {
    ctx.fillText(line, 30, 920 + i * 30);
  });
}

// Mouse: mover imagen
let isDragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    offsetX += dx;
    offsetY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
    drawCanvas();
  }
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

// Zoom con scroll
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.max(minScale, Math.min(maxScale, scale * delta));
  drawCanvas();
}, { passive: false });

// Tocar en celular: mover y zoom táctil
let startX, startY;
let initialDistance = 0;
let initialScale = scale;
let isPinching = false;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    isPinching = true;
    initialDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    initialScale = scale;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (isDragging && e.touches.length === 1) {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    offsetX += dx;
    offsetY += dy;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    drawCanvas();
  } else if (isPinching && e.touches.length === 2) {
    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const scaleFactor = currentDistance / initialDistance;
    scale = Math.max(minScale, Math.min(maxScale, initialScale * scaleFactor));
    drawCanvas();
  }
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDragging = false;
  isPinching = false;
});

btnDescargar.addEventListener('click', () => {
  if (!imageLoaded || !nombreInput.value.trim()) {
    alert("Por favor, sube una imagen y escribe tu nombre.");
    return;
  }

  const confirmacion = confirm("Por favor subir su imagen y datos al siguiente formulario para su registro como danzarin");
  if (!confirmacion) return;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 2000;
  exportCanvas.height = 2000;
  const exportCtx = exportCanvas.getContext('2d');

  // Escalar todo proporcionalmente
  const factor = 2;

  // Imagen
  if (imageLoaded) {
    const imgWidth = img.width * scale * factor;
    const imgHeight = img.height * scale * factor;
    const x = (2000 - imgWidth) / 2 + offsetX * factor;
    const y = (2000 - imgHeight) / 2 + offsetY * factor;
    exportCtx.drawImage(img, x, y, imgWidth, imgHeight);
  }

  // Marco
  const marcoGrande = new Image();
  marcoGrande.src = marco.src;
  marcoGrande.onload = () => {
    exportCtx.drawImage(marcoGrande, 0, 0, 2000, 2000);

    exportCtx.fillStyle = 'white';
    exportCtx.font = 'bold 72px Arial';
    exportCtx.textAlign = 'left';
    exportCtx.textBaseline = 'middle';

    const linesNombre = nombreInput.value.trim().split(" ");
    linesNombre.forEach((line, i) => {
      exportCtx.fillText(line, 60, 1700 + i * 55);
    });

    const danza = danzaSelect.value === 'otro' ? otraDanzaInput.value : danzaSelect.value;
    const linesDanza = ['DANZA:', danza];
    linesDanza.forEach((line, i) => {
      exportCtx.fillText(line, 60, 1850 + i * 55);
    });

    exportCanvas.toBlob(function(blob) {
      const num = Math.floor(Math.random() * 1000000);
      const filename = `SERGIO_VARGAS_GESTION_FUL_USFX_NACER_${num}.png`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSeTfMtTzWq7LVPUl8tJ5lIt2DnlISnz192LWabErIw70FN-wA/viewform?usp=header";
      }, 1500);
    }, 'image/png');
  };
});
