import streamlit as st

def diarization_page(tab_name):
    st.title("Speaker Diarization & Segmentation")
    st.markdown("---")

    # 1) Speaker Diarization
    st.header("1. Speaker Diarization")
    st.markdown(
        """
        Automatically identify “who spoke when” in each recording, separating child voice from interviewer and ambient noise.
        We leverage pretrained speaker‐diarization pipelines.
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • Algorithm: Neural Voice Activity Detection + clustering (pyannote.audio)  
            • Key call:  
              ```python
              from pyannote.audio import Pipeline
              pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization")
              diarization = pipeline({"uri": "filename", "audio": "path.wav"})
              ```  
            • Code location: `src/processing/diarization.py`  
            • Library: https://github.com/pyannote/pyannote-audio  
            """
        )

    st.markdown("---")

    # 2) Forced Alignment & Segmentation
    st.header("2. Forced Alignment & Segmentation")
    st.markdown(
        """
        Align text transcripts to audio timestamps and cut out speaker‐specific segments for downstream analysis.
        We use the Montreal Forced Aligner for precise word‐level timing.
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • Tool: Montreal Forced Aligner (MFA)  
            • Workflow:  
              1. Export diarization segments to WAV files  
              2. Run MFA with transcript `.TextGrid` output  
            • Code location: `src/processing/segmentation.py`  
            • Repo: https://github.com/MontrealCorpusTools/MFA  
            """
        )

    st.markdown("---")

    # 3) Post-Processing Quality Control (Post-QC)
    st.header("3. Post-Processing Quality Control (Post-QC)")
    st.markdown(
        """
        Verify that diarization and segmentation outputs meet quality standards:
        - Check no segments lost or truncated  
        - Confirm metadata alignment between audio and logs  
        - Perform random spot checks for segment accuracy  
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • Metrics:  
              - **Segment coverage**: total segment duration / original duration  
              - **Alignment mismatch**: timestamp differences vs. transcripts  
              - **Overlap error rate**: % of overlapping speech frames  
            • Tools: custom QC scripts (`src/processing/post_qc.py`)  
            • Process: generate CSV reports and manual review on 5% random samples  
            """
        )