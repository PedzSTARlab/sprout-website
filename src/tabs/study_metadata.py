import streamlit as st
from tabs.utils import create_html_table
import pandas as pd
import os
import datetime
from pathlib import Path


def show_table(key, button_text, show_table, csv_file_path, caption):
    # Initialize session state for table visibility
    show_table_prop = f'{show_table}_{key}'

    if  show_table_prop not in st.session_state:
        st.session_state[show_table_prop] = False

    if st.button(button_text, key):
        st.session_state[show_table_prop] = not st.session_state[show_table_prop]

    # Conditionally display the table
    if st.session_state[show_table_prop]:
        create_html_table(csv_file_path, caption, [], 0)

# Define the content of the Study Metadata page
def study_metadata_page(tab_name):

    # 1) Compute your project root (two levels up from this file)
    this_dir    = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(this_dir)
    workspace_root = os.path.dirname(project_root)

    # 2) Build the full path to your metadata.md
    md_file = os.path.join(workspace_root, "longitudinal-and-multi-site-studies.md")

    # 3) Check & load
    if os.path.isfile(md_file):
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
        st.markdown(content, unsafe_allow_html=True)
    else:
        st.markdown("""
        # SPROUT Metadata

        This is a placeholder for the metadata documentation. The actual metadata file could not be found.

        ## Data Structure

        The SPROUT dataset follows a structured organization with multiple sessions and visits encoded in the directory structure.
        """)

