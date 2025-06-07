// Elementos del DOM
const fotoInput = document.getElementById('fotoInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const marco = document.getElementById('marco');
const nombreInput = document.getElementById('nombre');
const danzaSelect = document.getElementById('danza');
const otraDanzaInput = document.getElementById('otraDanza');
const nombreDisplay = document.getElementById('nombreDisplay');
const danzaDisplay = document.getElementById('danzaDisplay').querySelector('span');
const sensibilidadRange = document.getElementById('sensibilidadRange');

// Configuración del canvas visible
canvas.width = 300;
canvas.height = 300;

// Variables para posicionar la imagen
let offsetX = 0;
let offsetY = 0;
let scale = 0.5; // Escala inicial: 50%
const minScale = 0.1;
const maxScale = 3;

// Sensibilidad del movimiento con teclas
let sensibilidad = parseInt(sensibilidadRange.value);

// Número aleatorio único para descarga
let downloadCounter = Math.floor(100000 + Math.random() * 900000);

// Cargar marco por defecto
marco.onload = () => {
  drawCanvas();
};

function toggleOtroInput() {
  if (danzaSelect.value === "otro") {
    otraDanzaInput.style.display = 'block';
  } else {
    otraDanzaInput.style.display = 'none';
  }
}

fotoInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      img.onload = () => {
        imageLoaded = true;
        scale = 0.5;
        offsetX = 0;
        offsetY = 0;
        drawCanvas();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

nombreInput.addEventListener('input', actualizarTexto);
danzaSelect.addEventListener('change', actualizarTexto);
otraDanzaInput.addEventListener('input', actualizarTexto);

sensibilidadRange.addEventListener('input', () => {
  sensibilidad = parseInt(sensibilidadRange.value);
});

function actualizarTexto() {
  let nombre = nombreInput.value.trim().split(" ");
  let danza = danzaSelect.value === "otro" ? otraDanzaInput.value : danzaSelect.value;

  nombreDisplay.innerHTML = nombre.join("<br>");
  danzaDisplay.innerHTML = danza.split(" ").join("<br>");
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (imageLoaded) {
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;

    const x = (canvas.width - imgWidth) / 2 + offsetX;
    const y = (canvas.height - imgHeight) / 2 + offsetY;

    ctx.drawImage(img, x, y, imgWidth, imgHeight);
  }

  // Dibujar marco encima
  if (marco.complete && marco.naturalHeight !== 0) {
    ctx.drawImage(marco, 0, 0, canvas.width, canvas.height);
  }

  // Dibujar texto en canvas
  ctx.fillStyle = 'white';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const linesNombre = nombreInput.value.trim().split(" ");
  linesNombre.forEach((line, i) => {
    ctx.fillText(line, 10, canvas.height / 2 - 20 + i * 16);
  });

  const linesDanza = ['DANZA:', ...(danzaSelect.value === 'otro' ? [otraDanzaInput.value] : [danzaSelect.value])];
  linesDanza.forEach((line, i) => {
    ctx.fillText(line, 10, canvas.height / 2 + 30 + i * 16);
  });
}

// ====== MOVIMIENTO CON RATÓN ======
let isDragging = false;
let startX, startY;

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
  canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    offsetX += e.offsetX - startX;
    offsetY += e.offsetY - startY;
    startX = e.offsetX;
    startY = e.offsetY;
    drawCanvas();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'default';
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  canvas.style.cursor = 'default';
});

// ====== MOVER CON TECLAS ======
document.addEventListener('keydown', (e) => {
  const step = sensibilidad / 2; // Más suave
  switch (e.key) {
    case 'ArrowUp':
      offsetY -= step;
      break;
    case 'ArrowDown':
      offsetY += step;
      break;
    case 'ArrowLeft':
      offsetX -= step;
      break;
    case 'ArrowRight':
      offsetX += step;
      break;
  }
  drawCanvas();
});

// ====== ZOOM CON RUEDA DEL RATÓN ======
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY;
  const step = 0.01; // Más suave
  if (delta < 0) {
    scale = Math.min(maxScale, scale + step);
  } else {
    scale = Math.max(minScale, scale - step);
  }
  drawCanvas();
}, { passive: false });

// ====== ZOOM CON BOTONES ======
function zoom(action) {
  const step = 0.02; // Más suave
  if (action === 'in') {
    scale = Math.min(maxScale, scale + step);
  } else if (action === 'out') {
    scale = Math.max(minScale, scale - step);
  }
  drawCanvas();
}

// ====== PINCH TO ZOOM EN MÓVIL ======
let isPinching = false;
let startDistance = null;
let lastScale = scale;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    isDragging = false;
    isPinching = true;
    startDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    lastScale = scale;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (e.touches.length === 1 && isDragging) {
    const touch = e.touches[0];
    offsetX += touch.clientX - startX;
    offsetY += touch.clientY - startY;
    startX = touch.clientX;
    startY = touch.clientY;
    drawCanvas();
  } else if (e.touches.length === 2 && isPinching) {
    const currentDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );

    const delta = currentDist - startDistance;
    const zoomFactor = delta * 0.005; // Zoom más suave
    scale = Math.min(maxScale, Math.max(minScale, lastScale + zoomFactor));
    drawCanvas();
  }
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDragging = false;
  isPinching = false;
});

canvas.addEventListener('dblclick', () => {
  scale = 0.5;
  offsetX = 0;
  offsetY = 0;
  drawCanvas();
});

// ====== DESCARGA DE IMAGEN EN 2000x2000 PX ======
function descargarImagen() {
  if (!imageLoaded || !nombreInput.value.trim()) {
    alert("Por favor, sube una imagen y escribe tu nombre.");
    return;
  }

  const confirmacion = confirm("Por favor subir su imagen y datos al siguiente formulario para su registro como danzarin");
  if (!confirmacion) return;

  drawCanvas(); // Asegúrate de que todo esté dibujado

  // Crear un canvas temporal de alta resolución
  const exportCanvas = document.createElement('canvas');
  const exportCtx = exportCanvas.getContext('2d');
  exportCanvas.width = 2000;
  exportCanvas.height = 2000;

  // Redibujar imagen escalada
  if (imageLoaded) {
    const imgWidth = img.width * scale * (2000 / 300);
    const imgHeight = img.height * scale * (2000 / 300);
    const x = (2000 - imgWidth) / 2 + offsetX * (2000 / 300);
    const y = (2000 - imgHeight) / 2 + offsetY * (2000 / 300);
    exportCtx.drawImage(img, x, y, imgWidth, imgHeight);
  }

  // Dibujar marco encima
  const tempImg = new Image();
  tempImg.src = marco.src;
  tempImg.onload = () => {
    exportCtx.drawImage(tempImg, 0, 0, 2000, 2000);

    // Dibujar texto en alta resolución
    exportCtx.fillStyle = 'white';
    exportCtx.font = 'bold 87px Arial'; // Texto escalado a 2000px
    exportCtx.textAlign = 'left';
    exportCtx.textBaseline = 'middle';

    const linesNombre = nombreInput.value.trim().split(" ");
    linesNombre.forEach((line, i) => {
      exportCtx.fillText(line, 70, 1000 - 70 + i * 54); // centrado
    });

    const linesDanza = ['DANZA:', ...(danzaSelect.value === 'otro' ? [otraDanzaInput.value] : [danzaSelect.value])];
    linesDanza.forEach((line, i) => {
      exportCtx.fillText(line, 70, 1000 + 100 + i * 54);
    });

    // Generar descarga
    exportCanvas.toBlob(function(blob) {
      if (!blob) {
        alert("Error al generar la imagen.");
        return;
      }

      const numeroAleatorio = Math.floor(100000 + Math.random() * 900000);
      const filename = `GEST_FUL_SERGIO_VARGAS_${numeroAleatorio}.png`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSeTfMtTzWq7LVPUl8tJ5lIt2DnlISnz192LWabErIw70FN-wA/viewform?usp=header";
      }, 2000);
    }, 'image/png');
  };
}
