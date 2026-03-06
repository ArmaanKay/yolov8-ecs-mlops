const imageInput = document.getElementById("imageInput");
const detectButton = document.getElementById("detectButton");
const previewImage = document.getElementById("previewImage");
const overlayCanvas = document.getElementById("overlayCanvas");
const statusMessage = document.getElementById("statusMessage");
const detectionList = document.getElementById("detectionList");

const canvasContext = overlayCanvas.getContext("2d");

let selectedFile = null;

function clearCanvas() {
  canvasContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

function clearDetections() {
  detectionList.innerHTML = "";
}

function resetViewer() {
  clearCanvas();
  clearDetections();
}

function renderDetectionList(detections) {
  clearDetections();

  if (!detections || detections.length === 0) {
    const listItem = document.createElement("li");
    listItem.textContent = "No objects detected.";
    detectionList.appendChild(listItem);
    return;
  }

  detections.forEach((detection) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${detection.label} (${(detection.confidence * 100).toFixed(1)}%)`;
    detectionList.appendChild(listItem);
  });
}

function resizeCanvasToImage() {
  overlayCanvas.width = previewImage.clientWidth;
  overlayCanvas.height = previewImage.clientHeight;
}

function drawDetections(detections, imageMeta) {
  clearCanvas();

  if (!detections || detections.length === 0) {
    return;
  }

  resizeCanvasToImage();

  const scaleX = previewImage.clientWidth / imageMeta.width;
  const scaleY = previewImage.clientHeight / imageMeta.height;

  canvasContext.lineWidth = 2;
  canvasContext.font = "16px Arial";

  detections.forEach((detection) => {
    const [x1, y1, x2, y2] = detection.bbox;

    const scaledX = x1 * scaleX;
    const scaledY = y1 * scaleY;
    const scaledWidth = (x2 - x1) * scaleX;
    const scaledHeight = (y2 - y1) * scaleY;

    canvasContext.strokeStyle = "red";
    canvasContext.fillStyle = "red";

    canvasContext.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

    const labelText = `${detection.label} ${(detection.confidence * 100).toFixed(1)}%`;

    const textX = scaledX;
    const textY = scaledY > 20 ? scaledY - 8 : scaledY + 18;

    canvasContext.fillText(labelText, textX, textY);
  });
}

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    selectedFile = null;
    previewImage.src = "";
    statusMessage.textContent = "No image selected.";
    resetViewer();
    return;
  }

  selectedFile = file;
  const imageUrl = URL.createObjectURL(file);

  previewImage.src = imageUrl;
  statusMessage.textContent = `Selected image: ${file.name}`;
  resetViewer();
});

detectButton.addEventListener("click", async () => {
  if (!selectedFile) {
    statusMessage.textContent = "Please choose an image first.";
    return;
  }

  try {
    statusMessage.textContent = "Sending image to backend for detection...";
    clearDetections();
    clearCanvas();

    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await fetch("/predict", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Prediction request failed.");
    }

    renderDetectionList(data.detections);

    if (previewImage.complete) {
      drawDetections(data.detections, data.image);
    } else {
      previewImage.onload = () => drawDetections(data.detections, data.image);
    }

    statusMessage.textContent = "Detection complete.";
    console.log("Prediction response:", data);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = `Error: ${error.message}`;
  }
});