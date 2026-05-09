---
title: GTSRB Traffic Sign Recognition
emoji: 🚦
colorFrom: blue
colorTo: indigo
sdk: streamlit
sdk_version: 1.31.0
app_file: app.py
pinned: false
license: mit
---

# 🚦 GTSRB Traffic Sign Recognition

A real-time traffic sign classifier powered by a fine-tuned ResNet18 achieving **98.85% test accuracy** on the German Traffic Sign Recognition Benchmark — matching human-level performance on this benchmark.

## Model

| Detail | Value |
|---|---|
| Architecture | ResNet18 (transfer learning) |
| Dataset | GTSRB — 43 classes, 50 000+ images |
| Test accuracy | **98.85%** |
| Input size | 64 × 64 px |
| Normalization | ImageNet mean / std |

The final fully-connected layer was replaced with `nn.Linear(512, 43)` and fine-tuned end-to-end with data augmentation (random crops, flips, color jitter) and the Adam optimizer.

## How to use

| Tab | Description |
|---|---|
| **Upload** | Drag-and-drop or browse a JPG / PNG / BMP / PPM image |
| **Camera** | Capture directly from your webcam |
| **Samples** | Click any thumbnail from the built-in sample set |

The app returns the **top-3 predictions** with confidence bars and a colour-coded verdict (✅ high / ⚠️ uncertain / ❌ low confidence).

## Tech stack

- **PyTorch** + **torchvision** — model & transforms
- **Streamlit** — interactive web UI
- **Pillow** — image I/O
- **GTSRB** — training & evaluation dataset

---

Built by **Ghandour & Maroun**

# traffic-signs-Resnet18
