document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Load tab content from separate HTML files
    function loadTabContent() {
        const tabs = [
            { id: 'data-flow', file: 'tabs/data-flow.html' },
            { id: 'data-collection', file: 'tabs/data-collection.html' },
            { id: 'metadata', file: 'tabs/metadata.html' },
            { id: 'pre-processing', file: 'tabs/pre-processing.html' },
            { id: 'diarization', file: 'tabs/diarization.html' },
            { id: 'asr', file: 'tabs/asr.html' },
            { id: 'data-governance', file: 'tabs/data-governance.html' }
        ];

        tabs.forEach(tab => {
            fetch(tab.file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    document.getElementById(tab.id).innerHTML = html;
                    // Initialize any Plotly charts or other interactive elements
                    initializeInteractiveElements();
                })
                .catch(error => {
                    console.error(`Could not load ${tab.file}: ${error}`);
                    document.getElementById(tab.id).innerHTML = `<p>Error loading content. Please try again later.</p>`;
                });
        });
    }

    // Switch tabs when clicked
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Initialize any interactive elements (charts, etc.)
    function initializeInteractiveElements() {
        // This function will be called after each tab's content is loaded
        // It will initialize any Plotly charts or other interactive elements

        // Example: Initialize Plotly charts if they exist
        const plotElements = document.querySelectorAll('.plotly-chart');
        plotElements.forEach(element => {
            if (element.hasAttribute('data-initialized')) return;

            try {
                const chartData = JSON.parse(element.getAttribute('data-chart'));
                Plotly.newPlot(element.id, chartData.data, chartData.layout, chartData.config);
                element.setAttribute('data-initialized', 'true');
            } catch (error) {
                console.error('Error initializing chart:', error);
            }
        });
    }

    // Load tab content on page load
    loadTabContent();
});
