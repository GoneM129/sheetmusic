let finalDataUrl = "";

const songTitle = document.getElementById("songTitle");
const imageFiles = document.getElementById("imageFiles");
const fileButton = document.getElementById("fileButton");
const mergeButton = document.getElementById("mergeButton");
const previewContainer = document.getElementById("previewContainer");
const resultCanvas = document.getElementById("resultCanvas");
const downloadButton = document.getElementById("downloadButton");
const status = document.getElementById("status");
const appRoot = document.querySelector(".sheetmusic-app");
const cardFrame = document.querySelector(".card-frame");
const cardShadow = document.querySelector(".card-shadow");

fileButton.addEventListener("click", () => {
  imageFiles.click();
});

imageFiles.addEventListener("change", () => {
  if (imageFiles.files.length > 0) {
    generateSheetMusic();
  }
});

mergeButton.addEventListener("click", generateSheetMusic);

downloadButton.addEventListener("click", () => {
  if (!finalDataUrl) return;
  const link = document.createElement("a");
  link.href = finalDataUrl;
  link.download = `${(songTitle.value || "sheetmusic").trim() || "sheetmusic"}.jpg`;
  link.click();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && document.activeElement === songTitle) {
    generateSheetMusic();
  }
});

function showStatus(message) {
  status.textContent = message;
  status.classList.toggle("is-visible", Boolean(message));
}

function resizeAppForSheet(sheetHeight) {
  const baseAppHeight = 768;
  const baseCardHeight = 798;
  const extraHeight = Math.max(0, sheetHeight - 320);
  const appHeight = Math.max(baseAppHeight, baseAppHeight + extraHeight);
  const cardHeight = Math.max(baseCardHeight, baseCardHeight + extraHeight);

  appRoot.style.height = `${appHeight}px`;
  cardFrame.style.height = `${cardHeight}px`;
  cardShadow.style.height = `${cardHeight}px`;
}

async function generateSheetMusic() {
  const title = songTitle.value.trim();

  if (!title) {
    alert("제목을 입력해주세요!");
    songTitle.focus();
    return;
  }

  if (imageFiles.files.length === 0) {
    alert("사진을 선택해주세요!");
    imageFiles.click();
    return;
  }

  showStatus("악보를 합치는 중입니다...");

  const files = Array.from(imageFiles.files).sort((first, second) =>
    first.name.localeCompare(second.name, undefined, { numeric: true })
  );

  try {
    const loadedImages = await Promise.all(files.map(loadImage));
    const ctx = resultCanvas.getContext("2d");

    const targetWidth = 385;
    let totalHeight = 0;
    const scaledDimensions = loadedImages.map((image) => {
      const scale = targetWidth / image.width;
      const scaledHeight = image.height * scale;
      totalHeight += scaledHeight;
      return { width: targetWidth, height: scaledHeight };
    });

    const titleHeight = 120;
    resultCanvas.width = 425;
    resultCanvas.height = titleHeight + totalHeight + 40;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

    ctx.fillStyle = "black";
    ctx.font = "bold 45px 'Malgun Gothic', serif";
    ctx.textAlign = "left";
    ctx.fillText(title, 30, 80);

    let currentY = titleHeight;
    loadedImages.forEach((image, index) => {
      const dim = scaledDimensions[index];
      const xOffset = (resultCanvas.width - dim.width) / 2;
      ctx.drawImage(image, xOffset, currentY, dim.width, dim.height);
      currentY += dim.height;
    });

    finalDataUrl = resultCanvas.toDataURL("image/jpeg", 1.0);
    previewContainer.style.height = `${resultCanvas.height + 60}px`;
    previewContainer.classList.add("is-visible");
    resizeAppForSheet(resultCanvas.height + 250);
    showStatus(`${files.length}개의 악보를 성공적으로 합쳤습니다.`);
  } catch (error) {
    console.error(error);
    alert("악보 이미지를 불러오는 중 오류가 발생했습니다.");
    showStatus("");
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}