const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const upload = document.getElementById('upload');
const nameInput = document.getElementById('nameInput');
const danzaSelect = document.getElementById('danzaSelect');
const danzaCustom = document.getElementById('danzaCustom');
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const downloadBtn = document.getElementById('download');

let image = new Image();
let scale = 1;
let pos = { x: 0, y: 0 };
let drag = false;
let start = { x: 0, y: 0 };
let frameImage = new Image();
frameImage.src = 'assets/marco.png';

let lastTouchDistance = 0;

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (image.src) {
    const imgW = image.width * scale;
    const imgH = image.height * scale;
    const x = pos.x;
    const y = pos.y;
    ctx.drawImage(image, x, y, imgW, imgH);
  }

  // Textos
  const fullName = nameInput.value.trim().split(/\s+/);
  const firstName = fullName[0] || '';
  const lastName = fullName[1] || '';

  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';

  ctx.fillText(firstName, 10, 30);
  ctx.fillText(lastName, 10, 50);

  ctx.fillStyle = 'yellow';
  ctx.fillText('DANZA:', 10, 75);

  ctx.fillStyle = 'white';
  let danzaValue = danzaSelect.value === 'Otro' ? danzaCustom.value.trim() : danzaSelect.value;
  if (danzaValue) {
    const words = danzaValue.split(' ');
    words.forEach((word, i) => {
      ctx.fillText(word, 10, 95 + i * 20);
    });
  }

  ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    image = new Image();
    image.onload = () => {
      // Inicializa posición y escala
      scale = Math.max(300 / image.width, 300 / image.height);
      pos = {
        x: (canvas.width - image.width * scale) / 2,
        y: (canvas.height - image.height * scale) / 2,
      };
      drawCanvas();
    };
    image.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

danzaSelect.addEventListener('change', () => {
  if (danzaSelect.value === 'Otro') {
    danzaCustom.style.display = 'block';
  } else {
    danzaCustom.style.display = 'none';
  }
  drawCanvas();
});

[nameInput, danzaCustom].forEach(el => el.addEventListener('input', drawCanvas));

canvas.addEventListener('mousedown', (e) => {
  drag = true;
  start.x = e.offsetX;
  start.y = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drag) return;
  pos.x += e.offsetX - start.x;
  pos.y += e.offsetY - start.y;
  start.x = e.offsetX;
  start.y = e.offsetY;
  drawCanvas();
});

canvas.addEventListener('mouseup', () => (drag = false));
canvas.addEventListener('mouseleave', () => (drag = false));

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  scale += e.deltaY < 0 ? 0.05 : -0.05;
  scale = Math.max(0.1, Math.min(5, scale));
  drawCanvas();
}, { passive: false });

// Zoom buttons
zoomIn.addEventListener('click', () => {
  scale = Math.min(scale + 0.05, 5);
  drawCanvas();
});
zoomOut.addEventListener('click', () => {
  scale = Math.max(scale - 0.05, 0.1);
  drawCanvas();
});

// Teclas para mover con precisión
window.addEventListener('keydown', (e) => {
  const step = 2;
  switch (e.key) {
    case 'ArrowLeft': pos.x -= step; break;
    case 'ArrowRight': pos.x += step; break;
    case 'ArrowUp': pos.y -= step; break;
    case 'ArrowDown': pos.y += step; break;
  }
  drawCanvas();
});

// Touch for mobile: drag
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    start.x = e.touches[0].clientX;
    start.y = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDistance = Math.hypot(dx, dy);
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (e.touches.length === 1) {
    const dx = e.touches[0].clientX - start.x;
    const dy = e.touches[0].clientY - start.y;
    pos.x += dx;
    pos.y += dy;
    start.x = e.touches[0].clientX;
    start.y = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const newDist = Math.hypot(dx, dy);
    const delta = newDist - lastTouchDistance;
    scale += delta * 0.005;
    scale = Math.max(0.1, Math.min(5, scale));
    lastTouchDistance = newDist;
  }
  drawCanvas();
}, { passive: false });

// Previene el zoom global en móviles
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

// Descargar imagen compuesta en alta resolución
downloadBtn.addEventListener('click', () => {
  alert("Por favor subir su imagen y datos al siguiente formulario para su registro como danzarin");

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = 2000;
  finalCanvas.height = 2000;
  const ctx2 = finalCanvas.getContext('2d');

  const scaleFactor = 2000 / 300;

  // Imagen base
  if (image.src) {
    const imgW = image.width * scale * scaleFactor;
    const imgH = image.height * scale * scaleFactor;
    const x = pos.x * scaleFactor;
    const y = pos.y * scaleFactor;
    ctx2.drawImage(image, x, y, imgW, imgH);
  }

  // Texto
  ctx2.font = 'bold 90px Arial';
  ctx2.fillStyle = 'white';
  ctx2.textAlign = 'left';
  const fullName = nameInput.value.trim().split(/\s+/);
  ctx2.fillText(fullName[0] || '', 60, 160);
  ctx2.fillText(fullName[1] || '', 60, 260);

  ctx2.fillStyle = 'yellow';
  ctx2.fillText('DANZA:', 60, 370);

  ctx2.fillStyle = 'white';
  let danzaValue = danzaSelect.value === 'Otro' ? danzaCustom.value.trim() : danzaSelect.value;
  if (danzaValue) {
    const words = danzaValue.split(' ');
    words.forEach((word, i) => {
      ctx2.fillText(word, 60, 470 + i * 100);
    });
  }

  // Marco
  const frameHighRes = new Image();
  frameHighRes.onload = () => {
    ctx2.drawImage(frameHighRes, 0, 0, 2000, 2000);
    finalCanvas.toBlob(blob => {
      const link = document.createElement('a');
      const num = Math.floor(Math.random() * 9000) + 1000;
      link.download = `Sergio_Vargas_Gestion_Ful_USFX_${num}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();

      setTimeout(() => {
        window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSeTfMtTzWq7LVPUl8tJ5lIt2DnlISnz192LWabErIw70FN-wA/viewform?usp=header';
      }, 4000);
    }, 'image/png');
  };
  frameHighRes.src = 'assets/marco.png';
});
