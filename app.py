import json
import os
from pathlib import Path

import streamlit as st
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="GTSRB Traffic Sign Recognition",
    page_icon="🚦",
    layout="wide",
)

# ── Constants ─────────────────────────────────────────────────────────────────
MODEL_PATH = "model/best_model.pth"
CLASS_NAMES_PATH = "class_names.json"
NUM_CLASSES = 43

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

EVAL_TRANSFORM = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

# ── Load resources ────────────────────────────────────────────────────────────
@st.cache_resource
def load_model():
    model = models.resnet18(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, NUM_CLASSES)
    state_dict = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model


@st.cache_resource
def load_class_names():
    with open(CLASS_NAMES_PATH, "r") as f:
        return json.load(f)


# ── Inference ─────────────────────────────────────────────────────────────────
def predict(image: Image.Image, model, class_names):
    img = image.convert("RGB")
    tensor = EVAL_TRANSFORM(img).unsqueeze(0)
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)[0]
    top3_probs, top3_indices = torch.topk(probs, 3)
    results = [
        (class_names[idx.item()], prob.item())
        for idx, prob in zip(top3_indices, top3_probs)
    ]
    return results


# ── UI helpers ────────────────────────────────────────────────────────────────
def confidence_bar(label: str, confidence: float, is_top: bool):
    pct = confidence * 100
    if is_top:
        bar_style = (
            "background: linear-gradient(90deg, #1a73e8, #0d47a1);"
            "border-radius: 6px; height: 22px;"
        )
        text_color = "#1a73e8"
    else:
        bar_style = (
            "background: #9e9e9e;"
            "border-radius: 6px; height: 22px;"
        )
        text_color = "#616161"

    html = f"""
    <div style="margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-size: 14px; font-weight: {'700' if is_top else '500'};
                     color: {'#1a1a1a' if is_top else '#555'};">{label}</span>
        <span style="font-size: 14px; font-weight: 600; color: {text_color};">{pct:.1f}%</span>
      </div>
      <div style="background: #e0e0e0; border-radius: 6px; height: 22px; overflow: hidden;">
        <div style="{bar_style} width: {pct:.1f}%;"></div>
      </div>
    </div>
    """
    return html


def show_predictions(predictions):
    top_label, top_conf = predictions[0]

    if top_conf >= 0.90:
        st.success(f"**{top_label}** — {top_conf*100:.1f}% confidence")
    elif top_conf >= 0.60:
        st.warning(f"**{top_label}** — {top_conf*100:.1f}% confidence (uncertain)")
    else:
        st.error(f"**{top_label}** — {top_conf*100:.1f}% confidence (low confidence)")

    st.markdown("#### Top-3 Predictions")
    bars_html = ""
    for i, (label, conf) in enumerate(predictions):
        bars_html += confidence_bar(label, conf, is_top=(i == 0))
    st.markdown(bars_html, unsafe_allow_html=True)


def run_and_display(image: Image.Image, model, class_names):
    col_img, col_pred = st.columns([1, 1], gap="large")
    with col_img:
        st.image(image, caption="Input image", use_container_width=True)
    with col_pred:
        with st.spinner("Running inference…"):
            predictions = predict(image, model, class_names)
        show_predictions(predictions)


# ── Sidebar ───────────────────────────────────────────────────────────────────
def render_sidebar():
    with st.sidebar:
        st.markdown("## 🚦 Model Info")
        st.markdown(
            """
| Field | Value |
|---|---|
| Architecture | ResNet18 |
| Dataset | GTSRB |
| Classes | 43 |
| Input size | 64 × 64 |
| Test accuracy | **98.85%** |
| Training | Transfer learning |
| Optimizer | Adam |
| Augmentation | Yes |
"""
        )
        st.markdown("---")
        st.markdown("### About GTSRB")
        st.markdown(
            "The **German Traffic Sign Recognition Benchmark** contains over "
            "50,000 images across 43 traffic sign classes, captured under "
            "varying lighting and weather conditions."
        )
        st.markdown("---")
        st.markdown(
            "<div style='text-align: center; color: #888; font-size: 13px;'>"
            "Built by <strong>Ghandour &amp; Maroun</strong>"
            "</div>",
            unsafe_allow_html=True,
        )


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    render_sidebar()

    st.markdown("# 🚦 Traffic Sign Recognition")
    st.markdown(
        "Upload an image, capture from your webcam, or select a sample — "
        "the model will identify the traffic sign in real time."
    )
    st.markdown("---")

    model = load_model()
    class_names = load_class_names()

    tab_upload, tab_camera, tab_samples = st.tabs(
        ["📁 Upload", "📷 Camera", "🖼️ Samples"]
    )

    # ── Upload tab ────────────────────────────────────────────────────────────
    with tab_upload:
        st.markdown("### Upload a traffic sign image")
        uploaded = st.file_uploader(
            "Supported formats: JPG, JPEG, PNG, PPM, BMP",
            type=["jpg", "jpeg", "png", "ppm", "bmp"],
        )
        if uploaded is not None:
            image = Image.open(uploaded)
            run_and_display(image, model, class_names)

    # ── Camera tab ────────────────────────────────────────────────────────────
    with tab_camera:
        st.markdown("### Capture from webcam")
        st.info("Point your camera at a traffic sign and click **Take photo**.")
        camera_photo = st.camera_input("Take photo")
        if camera_photo is not None:
            image = Image.open(camera_photo)
            run_and_display(image, model, class_names)

    # ── Samples tab ───────────────────────────────────────────────────────────
    with tab_samples:
        st.markdown("### Sample images")
        samples_dir = Path("samples")
        sample_files = sorted(
            f for f in samples_dir.iterdir()
            if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".ppm", ".bmp"}
        ) if samples_dir.exists() else []

        if not sample_files:
            st.info(
                "No sample images found. Add images to the `samples/` folder "
                "to enable this tab."
            )
        else:
            cols = st.columns(3)
            for i, sample_path in enumerate(sample_files):
                with cols[i % 3]:
                    img = Image.open(sample_path)
                    st.image(img, caption=sample_path.name, use_container_width=True)
                    if st.button(f"Classify", key=f"sample_{i}"):
                        run_and_display(img, model, class_names)


if __name__ == "__main__":
    main()
