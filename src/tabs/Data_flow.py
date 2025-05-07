import streamlit as st
import base64
from pathlib import Path
import streamlit.components.v1 as components

def data_flow_page(tab_name):
    st.markdown("## SPROUT Data Processing Flow")
    st.markdown("---")

    # 1) Textual breakdown
    st.markdown("""
    **1. Data Collection**
    - Tools: Adobe Audition (`.wav`), Zoom (`.m4a`/`.mp4`), SharePoint transcripts
    - Raw files live on SharePoint; then copied to processing server

    **2. File Handling & Metadata**
    - BIDS-style directory structure
    - Rename, remove empty files, associate transcripts

    **3. Pre-processing & QC**
    - Noise reduction, silence trimming, normalization
    - Generate QC reports (SNR, clipping, duration)

    **4. Diarization & Segmentation**
    - Manual speaker labeling + forced alignment (Montreal Forced Aligner)
    - Produce child-only audio segments

    **5. Annotation & Feature Extraction**
    - Expert phonetic labels + auto-extracted features (MFCC, prosody)
    - Store artifacts in feature store (e.g., Git LFS or cloud bucket)

    **6. ASR & Transcription**
    - Run Whisper / wav2vec-2.0 → timestamped transcripts

    **7. Modeling & Analysis**
    - Train classifiers, bias analysis, explainability pipelines
    """)

    # 2) Display a diagram instead of embedding PDF

    st.markdown("""
    ## Data Flow Diagram

    ```
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │  Data Collection │────▶│  Pre-processing  │────▶│   Diarization   │
    └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                            │
                                                            ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │ Model Training  │◀────│  Feature Extract │◀────│  ASR Processing │
    └─────────────────┘     └─────────────────┘     └─────────────────┘
    ```

    The diagram above illustrates the data processing flow from collection to model training.
    """)