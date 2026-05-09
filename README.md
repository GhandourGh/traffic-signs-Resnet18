# traffic-signs-Resnet18

German Traffic Sign Recognition Benchmark (**GTSRB**) classifier with a **React + Vite** web UI and a **FastAPI** inference API. Built for demos and class presentation: large analysis view, **top-3 predictions** with confidence bars, and an optional **bounding box** overlay around the detected sign region (heuristic localization, not a separate detector model).

**Authors:** Ghandour & Maroun

---

## Model

| Detail | Value |
|--------|--------|
| Architecture | ResNet18 (ImageNet-style backbone, custom head) |
| Classes | 43 (GTSRB) |
| Reported test accuracy | **98.85%** |
| Input | 64×64 RGB, ImageNet mean/std normalization |
| Weights | `model/best_model.pth` |

The classifier head is `nn.Linear(512, 43)` on top of a ResNet18 backbone.

---

## Features (current UI)

- **Identify** — full-width “presentation mode” panel: large image, verdict card, top-3 bars.
- **Samples** — dedicated gallery; click a thumbnail to classify (no file upload in the UI).
- **Bounding box** — API returns normalized `bbox` `{ x, y, w, h }` when localization succeeds; the UI draws a box without dimming the rest of the image.

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Model | PyTorch, torchvision, Pillow, NumPy |
| API | FastAPI, Uvicorn |
| Frontend | React 18, Vite 5, Tailwind CSS 3 |

**Optional:** `app.py` is a **Streamlit** UI for the same model (Hugging Face / local notebook-style demos).

---

## Project layout

```
traffic_light/
├── backend.py          # FastAPI: /api/predict, /api/samples
├── app.py              # Optional Streamlit UI
├── class_names.json    # 43 class labels
├── model/best_model.pth
├── samples/            # Gallery images (served by API)
├── frontend/           # Vite + React app
└── requirements.txt
```

---

## Run locally

**1. Python environment**

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**2. API (from repo root)**

```bash
uvicorn backend:app --reload --port 8000
```

**3. Frontend (separate terminal)**

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). The dev server **proxies** `/api` to `http://localhost:8000` (see `frontend/vite.config.js`).

**Production frontend build**

```bash
cd frontend && npm run build
```

Serve `frontend/dist` with any static host; configure that host to forward `/api` to your FastAPI server, or set an explicit API base URL if you change the setup.

---

## Optional: Streamlit

```bash
streamlit run app.py
```

Uses the same `model/best_model.pth` and `class_names.json`.

---

## License

MIT
