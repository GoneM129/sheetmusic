let finalDataUrl = "";

const songTitle = document.getElementById("songTitle");
const imageFiles = document.getElementById("imageFiles");
const fileButton = document.getElementById("fileButton");
const mergeButton = document.getElementById("mergeButton");
const previewContainer = document.getElementById("previewContainer");
const resultCanvas = document.getElementById("resultCanvas");
const downloadButton = document.getElementById("downloadButton");
const status = document.getElementById("status");

fileButton.addEventListener("click", () => {
  imageFiles.click();
});

imageFiles.addEventListener("change", () => {
  if (imageFiles.files.length > 0) {
    generateSheetMusic(); // 파일을 선택하자마자 바로 병합 함수 실행
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
    const maxWidth = Math.max(...loadedImages.map((image) => image.width));
    const titleHeight = 150;
    const totalImageHeight = loadedImages.reduce((sum, image) => sum + image.height, 0);

    resultCanvas.width = maxWidth + 60;
    resultCanvas.height = titleHeight + totalImageHeight + 40;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

    ctx.fillStyle = "black";
    ctx.font = "bold 70px 'Malgun Gothic', serif";
    ctx.textAlign = "left";
    ctx.fillText(title, 40, 100);

    let currentY = titleHeight;

    loadedImages.forEach((image) => {
      const xOffset = (resultCanvas.width - image.width) / 2;
      ctx.drawImage(image, xOffset, currentY);
      currentY += image.height;
    });

    finalDataUrl = resultCanvas.toDataURL("image/jpeg", 1.0);
    const newHeight = 451 + resultCanvas.height + 100;
    document.querySelector('.sheetmusic-app').style.height = newHeight + 'px';
    document.querySelector('.card-frame').style.height = (newHeight - 30) + 'px';
    document.querySelector('.card-shadow').style.height = (newHeight - 30) + 'px';
    previewContainer.classList.add("is-visible");
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
