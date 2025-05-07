import streamlit as st

def overview_page(tab_name):
    #st.info("Training opportunities for using the dataset: [https://www.b2aivoicescholars.org/](https://www.b2aivoicescholars.org/)")
    st.markdown(
        """
        ## Overview of SPROUT (Speech Production Repository for Optimizing Use for AI Technologies)-Sample
        
        The SPROUT (Speech Production Repository for Optimizing Use for AI Technologies) project is designed to support the development of automatic speech recognition (ASR) systems and AI-driven tools for early childhood assessment. SPROUT focuses on collecting speech samples from four-year-old children—a strategic choice that targets the developmental midpoint of speech sound acquisition in American English. This age group provides an ideal balance: minimizing the frequent developmental errors seen in younger children while still challenging model performance more than fully developed speech in older children. The data set is  
        To ensure equity and robustness in AI development, SPROUT prioritizes speaker variability. The dataset is built using a balanced recruitment strategy across racial/ethnic groups (Black, Latine, and White) and socioeconomic status (at or below 100%, and between 100%–200% of the federal poverty line). Recordings were collected across seven geographically diverse U.S. cities—St. Louis (MO), Los Angeles (CA), Dallas (TX), Orlando (FL), Atlanta (GA), Baltimore (MD), and Iselin (NJ)—through a partnership with a healthcare research firm. 
        Importantly, SPROUT was designed with robust ethical protections to safeguard the use of child speech in AI research. All data collection followed rigorous human subjects research protocols, including informed parental consent, options for data sharing preferences, and strict data privacy and security measures. These protections ensure that SPROUT supports innovation in a way that is transparent, respectful, and centered on the rights and dignity of children and families. 
        Developed through a collaborative, community-engaged approach, SPROUT enables cross-disciplinary research in speech-language pathology, machine learning, education, and child development. It supports the development of tools for early speech disorder detection, language development tracking, and culturally responsive assessment practices. 
        
        ### Our Commitment  
        At the Pediatric Speech Technologies and Acoustics Research (PedzSTAR) Lab, we are committed to advancing ethical, inclusive research that supports early identification of speech and language disorders through the development of AI-powered tools grounded in community input and real-world need. Guided by the principles of FAIR data use—making data Findable, Accessible, Interoperable, and Reusable—our work prioritizes transparency, responsible design, and equitable impact to ensure that all children, regardless of race, language background, or socioeconomic status, are accurately and justly served. 
        **Please Note:** The public data releases do not contain pediatric data. It also does not contain an equal distribution 
        of these categories of diseases. Further releases will contain additional data.
        """
    )
    
    st.markdown(
        """
        ## Data Access
        
        ### Access audio recordings

        We need to create a data access page for the SPROUT dataset. Bridge2ai used CANVA to create the data access page. The page is available at the following URL: [https://wustl-catalog.instructure.com/courses/643/pages/how-to-access-the-data](https://wustl-catalog.instructure.com/courses/643/pages/how-to-access-the-data). We need to decide if we want to use the same page for the SPROUT dataset or create a new one.
    """
    )
    #st.link_button("Bridge2AI-Voice: An ethically-sourced, diverse voice dataset linked to health information", type="primary", url="https://doi.org/10.13026/37yb-1t42",  help="Bridge2AI-Voice: An ethically-sourced, diverse voice dataset linked to health information", icon=":material/login:")
    
    """st.markdown(
        
        #### Dataset including raw audio

        Raw audio is available under a controlled access mechanism. This process includes:

        * Signing a Data Use Agreement (DUA): [B2AI-Voice | Data Transfer and Use Agreement 2025.pdf](https://wustl-catalog.instructure.com/courses/643/files/119379?verifier=zkUY544cRCsMK1AOJ8kmBOZ0Bygb1abMIRYGXN2t)
        * Submitting a Data Access Request Form (DARF): [B2AI-Voice | Data Access Request Form 2025.pdf](https://wustl-catalog.instructure.com/courses/643/files/119378?verifier=G4HCfwReB5YIaaOENJAC3FLf6iym7C1jwCd5IxsG)

        This process will require an institutional signature from a business official, a review by the Data Access Committee, and after approval, will be countersigned by USF. Once all forms are signed, the dataset can be obtained by submitting the counter-signed forms through PhysioNet at the following URL: 
        
    )
    st.link_button("Bridge2AI-Voice: An ethically-sourced, diverse voice dataset linked to health information (Audio included)", type="primary", url="https://physionet.org/content/b2ai-voice-audio/",  help="Bridge2AI-Voice: An ethically-sourced, diverse voice dataset linked to health information (Audio included)", icon=":material/login:")
                   
    st.markdown(
        
        ### Older Versions
        
        An earlier version of the feature only dataset is available on HealthDataNexus, which provides cloud-compute alongside the dataset rather than allowing data downloads.
        
    )

    st.link_button("Request Data Access to v1.0 via Health Data Nexus", type="primary", url="https://healthdatanexus.ai/content/b2ai-voice/1.0/",  help="Register for Data Access via Health Data Nexus", icon=":material/login:")
    """