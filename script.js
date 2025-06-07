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

  // Textos (centrado a la izquierda)
  const fullName = nameInput.value.trim().split(/\s+/);
  const firstName = fullName[0] || '';
  const lastName = fullName[1] || '';

  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';

  // Posición izquierda centrada verticalmente
  const textX = 15;
  const startY = 80;
  let yOffset = 0;

  ctx.fillStyle = 'white';
  ctx.fillText(firstName, textX, startY + yOffset);
  yOffset += 20;
  ctx.fillText(lastName, textX, startY + yOffset);
  yOffset += 30;

  ctx.fillStyle = 'yellow';
  ctx.fillText('DANZA:', textX, startY + yOffset);
  yOffset += 25;

  ctx.fillStyle = 'white';
  let danzaValue = danzaSelect.value === 'Otro' ? danzaCustom.value.trim() : danzaSelect.value;
  if (danzaValue) {
    const words = danzaValue.split(' ');
    words.forEach((word, i) => {
      ctx.fillText(word, textX, startY + yOffset + i * 20);
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
  danzaCustom.style.display = danzaSelect.value === 'Otro' ? 'block' : 'none';
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
  scale += e.deltaY < 0 ? 0.01 : -0.01;
  scale = Math.max(0.1, Math.min(5, scale));
  drawCanvas();
}, { passive: false });

zoomIn.addEventListener('click', () => {
  scale = Math.min(scale + 0.01, 5);
  drawCanvas();
});
zoomOut.addEventListener('click', () => {
  scale = Math.max(scale - 0.01, 0.1);
  drawCanvas();
});

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
    scale += delta * 0.002;
    scale = Math.max(0.1, Math.min(5, scale));
    lastTouchDistance = newDist;
  }
  drawCanvas();
}, { passive: false });

document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

downloadBtn.addEventListener('click', () => {
  alert("Por favor subir su imagen y datos al siguiente formulario para su registro como danzarin");

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = 2000;
  finalCanvas.height = 2000;
  const ctx2 = finalCanvas.getContext('2d');
  const scaleFactor = 2000 / 300;

  if (image.src) {
    const imgW = image.width * scale * scaleFactor;
    const imgH = image.height * scale * scaleFactor;
    const x = pos.x * scaleFactor;
    const y = pos.y * scaleFactor;
    ctx2.drawImage(image, x, y, imgW, imgH);
  }

  const fullName = nameInput.value.trim().split(/\s+/);
  ctx2.font = 'bold 90px Arial';
  ctx2.textAlign = 'left';
  const textX = 100;
  let yOffset = 300;

  ctx2.fillStyle = 'white';
  ctx2.fillText(fullName[0] || '', textX, yOffset);
  yOffset += 100;
  ctx2.fillText(fullName[1] || '', textX, yOffset);
  yOffset += 120;

  ctx2.fillStyle = 'yellow';
  ctx2.fillText('DANZA:', textX, yOffset);
  yOffset += 100;

  ctx2.fillStyle = 'white';
  let danzaValue = danzaSelect.value === 'Otro' ? danzaCustom.value.trim() : danzaSelect.value;
  if (danzaValue) {
    const words = danzaValue.split(' ');
    words.forEach((word, i) => {
      ctx2.fillText(word, textX, yOffset + i * 100);
    });
  }

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
