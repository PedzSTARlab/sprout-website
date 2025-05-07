import os
import streamlit as st
from tabs.overview import overview_page
from tabs.collection_methods import collection_methods_page
from tabs.data_governance import data_governance_page
from tabs.study_dashboard import study_dashboard_page
from tabs.study_metadata import study_metadata_page
from tabs.healthsheet import healthsheet_page
from tabs.data_pre_processing import data_pre_processing_page
from tabs.ai_readiness import ai_readiness_page
from tabs.Data_flow import data_flow_page
from tabs.diarization import diarization_page
from tabs.asr import asr_page

def config_page(version):
    st.set_page_config(
        page_title="SPROUT Dashboard",
        page_icon="images/PedzSTARLab.png" if os.path.exists("images/PedzSTARLab.png") else None,
        layout="wide")

    # Add the CSS file
    with open("css/dashboard.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

    # Add review notice header

    # Use st.title for the dashboard header
    st.title("SPROUT Dashboard")

    # Add the footer

def create_tabs(tabs_func):
    tab_names = list(tabs_func.keys())
    tabs = st.tabs(tab_names)
    for tab, name in zip(tabs, tab_names):
        with tab:
            tabs_func[name](name)

def main():
    # Current version of the app
    version = "2.0.0"
    # Map tab names to functions
    # In this dictionary, the key is the tab name and the value is the function that will be called when the tab is selected
    # The function is defined in the respective file
    # overview_page() is defined in tabs/overview.py
    # collections_methods_page() is defined in tabs/collections_methods.py
    # data_governance_page() is defined in tabs/data_governance.py
    # study_dashboard_page() is defined in tabs/study_dashboard.py
    # study_metadata_page() is defined in tabs/study_metadata.py
    # healthsheet_page() is defined in tabs/healthsheet.py
    # data_pre_processing_page() is defined in tabs/data_pre_processing.py
    # ai_readiness_page() is defined in tabs/ai_readiness.py
    # if 'current_tab' not in st.session_state:
    #     st.session_state['current_tab'] = 'Study Metadata'
    # if 'scroll_to' not in st.session_state:
    #     st.session_state['scroll_to'] = None

    tab_functions = {
        "Research Overview": overview_page,
        "Data Flow": data_flow_page,
        "Data Collection": collection_methods_page,
        "Metadata": study_metadata_page,
        "Pre-Processing": data_pre_processing_page,
        "Diarization": diarization_page,
        "ASR": asr_page,
        "Data Governance": data_governance_page,
        #"Study Dashboard": study_dashboard_page,
        #"Healthsheet": healthsheet_page,
        #"AI-Readiness": ai_readiness_page,
    }

    # Set page configuration
    config_page(version)
    # Create tabs
    create_tabs(tab_functions)

if __name__ == "__main__":
    main()