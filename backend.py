from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import json
import io
import numpy as np
from pathlib import Path

app = FastAPI(title="Traffic Sign Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NUM_CLASSES = 43
SAMPLES_DIR = Path("samples")
ALLOWED = {".jpg", ".jpeg", ".png", ".ppm", ".bmp"}

_transform = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def _build_model():
    m = models.resnet18(weights=None)
    m.fc = nn.Linear(m.fc.in_features, NUM_CLASSES)
    m.load_state_dict(torch.load("model/best_model.pth", map_location="cpu"))
    m.eval()
    return m


_model = _build_model()

with open("class_names.json") as f:
    _class_names = json.load(f)


def _run_inference(image: Image.Image):
    tensor = _transform(image.convert("RGB")).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(_model(tensor), dim=1)[0]
    top3_probs, top3_idx = torch.topk(probs, 3)
    return [
        {"label": _class_names[i.item()], "confidence": round(p.item(), 4)}
        for i, p in zip(top3_idx, top3_probs)
    ]


def _detect_bbox(image: Image.Image):
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    if rgb.size == 0:
        return None

    h, w = rgb.shape[:2]
    if h < 8 or w < 8:
        return None

    gray = (0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]).astype(np.float32)

    gx = np.abs(np.diff(gray, axis=1, append=gray[:, -1:]))
    gy = np.abs(np.diff(gray, axis=0, append=gray[-1:, :]))
    edges = gx + gy

    edge_thresh = np.percentile(edges, 84)
    edge_mask = edges >= edge_thresh

    color_std = np.std(rgb, axis=2)
    color_mask = color_std >= np.percentile(color_std, 52)

    mask = edge_mask & color_mask
    ys, xs = np.where(mask)
    if ys.size < max(120, int(0.003 * h * w)):
        return None

    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())

    pad_x = max(2, int((x1 - x0 + 1) * 0.08))
    pad_y = max(2, int((y1 - y0 + 1) * 0.08))
    x0 = max(0, x0 - pad_x)
    y0 = max(0, y0 - pad_y)
    x1 = min(w - 1, x1 + pad_x)
    y1 = min(h - 1, y1 + pad_y)

    bw = x1 - x0 + 1
    bh = y1 - y0 + 1
    area_ratio = (bw * bh) / float(w * h)
    if area_ratio < 0.01 or area_ratio > 0.95:
        return None

    return {
        "x": round(x0 / w, 4),
        "y": round(y0 / h, 4),
        "w": round(bw / w, 4),
        "h": round(bh / h, 4),
    }


@app.get("/api/samples")
def list_samples():
    if not SAMPLES_DIR.exists():
        return []
    return [
        {"name": f.name, "url": f"/api/samples/{f.name}"}
        for f in sorted(SAMPLES_DIR.iterdir())
        if f.suffix.lower() in ALLOWED
    ]


@app.get("/api/samples/{filename}")
def get_sample(filename: str):
    path = SAMPLES_DIR / filename
    if not path.exists() or path.suffix.lower() not in ALLOWED:
        raise HTTPException(status_code=404, detail="Sample not found")
    return FileResponse(path)


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    data = await file.read()
    try:
        image = Image.open(io.BytesIO(data))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")
    return {"predictions": _run_inference(image), "bbox": _detect_bbox(image)}
