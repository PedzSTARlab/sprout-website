import streamlit as st

def asr_page(tab_name):
    st.title("Automatic Speech Recognition (ASR)")
    st.markdown("---")

    # 1) ASR Models
    st.header("1. ASR Models")
    st.markdown(
        """
        Transcribe child speech to text using state-of-the-art pretrained models.
        We support both OpenAI Whisper and Facebook’s wav2vec-2.0 fine-tuned on domain data.
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • **Whisper** (OpenAI)  
              ```python
              import whisper
              model = whisper.load_model("base")
              result = model.transcribe("path.wav")
              transcript = result["text"]
              ```  
            • **wav2vec-2.0** (fairseq/huggingface)  
              ```python
              from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
              proc = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
              model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")
              input_values = proc(audio, sampling_rate=sr, return_tensors="pt").input_values
              logits = model(input_values).logits
              pred_ids = logits.argmax(dim=-1)
              transcript = proc.batch_decode(pred_ids)[0]
              ```  
            • Code location: `src/processing/asr.py`  
            • Libraries: `openai-whisper`, `transformers`, `soundfile`
            """
        )

    st.markdown("---")

    # 2) Post-Processing & Formatting
    st.header("2. Transcript Post-Processing")
    st.markdown(
        """
        Clean and structure raw transcripts:
        - Remove filler tokens (`[unk]`, punctuation cleanup)  
        - Sentence segmentation & capitalization  
        - Align timestamps if needed for downstream annotation
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • Filler removal via regex: `re.sub(r'\\[.*?\\]', '', text)`  
            • Sentence split with `nltk.sent_tokenize`  
            • Timestamps from model outputs saved to JSON alongside `.wav`
            • Code location: `src/processing/asr_post.py`
            """
        )

    st.markdown("---")

    # 3) ASR Quality Control
    st.header("3. ASR Quality Control")
    st.markdown(
        """
        Evaluate transcription accuracy:
        - **Word Error Rate (WER)** against manual transcripts  
        - **Character Error Rate (CER)** for fine-grained analysis  
        - Flag high-WER files for manual review
        """
    )
    with st.expander("Implementation details"):
        st.markdown(
            """
            • WER/CER computed using `jiwer` package:  
              ```python
              from jiwer import wer, cer
              error = wer(ref, hyp); char_err = cer(ref, hyp)
              ```  
            • Threshold: WER ≤ 50% for automatic acceptance  
            • Code location: `src/processing/asr_qc.py`
            """
        )