import streamlit as st

def data_pre_processing_page(tab_name):
    st.title("Data Pre-Processing Pipeline")
    st.markdown("---")

    # 1) Denoising
    st.header("1. Denoising")
    st.markdown(
        """
        Remove background noise and artifacts (mic clicks, hum, etc.) while preserving speech.
        We use a spectral-gating approach via the `noisereduce` library.
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • Algorithm: spectral gating (Wiener filter)  
            • Key call: `nr.reduce_noise(y, sr, prop_decrease=1.0, stationary=False)`  
            • Code location: `src/processing/denoise.py`  
            • Library: https://github.com/timsainb/noisereduce  
            """
        )
    st.markdown("---")

    # 2) Loudness Normalization
    st.header("2. Loudness Normalization")
    st.markdown(
        """
        Standardize loudness to a target LUFS (Integrated Loudness) using the `pyloudnorm` library.
        Ensures consistent playback levels across all recordings.
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • Standard: ITU-R BS.1770 integrated loudness (LUFS)  
            • Key calls:  
              - `meter = pyln.Meter(sr)`  
              - `pyln.normalize.loudness(clean, measured, target_lufs)`  
            • Code location: `src/processing/normalize.py`  
            • Library: https://github.com/csteinmetz1/pyloudnorm  
            """
        )
    st.markdown("---")

    # 3) Pre-Processing Quality Control
    st.header("3. Pre-Processing Quality Control")
    st.markdown(
        """
        Compute and log basic QC metrics before further processing:
        - Signal-to-Noise Ratio (SNR)  
        - Clipping percentage  
        - Duration (seconds)
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • Metrics computed using NumPy and Librosa:  
              - **SNR:** ratio of signal vs. estimated noise power  
              - **Clipping:** % samples ≥ 0.999 amplitude  
              - **Duration:** sample_count / sample_rate  
            • Thresholds set for child speech (e.g. SNR ≥ 15 dB, Duration ≥ 1 s)  
            • Code location: `src/processing/pre_qc.py`  
            """
        )
    st.markdown("---")

    st.markdown(
        """
        **Toolkits used**  
        - `noisereduce` for denoising  
        - `pyloudnorm` for loudness normalization  
        - `numpy`, `librosa` for QC metrics  
        
        Continue to the **Diarization** and **Feature Extraction** tabs for the next stages.
        """
    )
