document.addEventListener('DOMContentLoaded', function() {
    // Initialize all collapsible panels
    initCollapsiblePanels();
    
    // Re-initialize when tab content is loaded
    document.addEventListener('tabContentLoaded', function() {
        initCollapsiblePanels();
        Prism.highlightAll();
    });
});

function initCollapsiblePanels() {
    const panels = document.querySelectorAll('.collapsible-panel');
    
    panels.forEach(panel => {
        const header = panel.querySelector('.collapsible-header');
        const content = panel.querySelector('.collapsible-content');
        
        // Skip if already initialized
        if (header.hasAttribute('data-initialized')) {
            return;
        }
        
        header.setAttribute('data-initialized', 'true');
        
        header.addEventListener('click', function() {
            // Toggle active class
            this.classList.toggle('active');
            
            // Toggle content visibility
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

// Helper function to create collapsible panels programmatically
function createCollapsiblePanel(title, content, isOpen = false) {
    const panel = document.createElement('div');
    panel.className = 'collapsible-panel';
    
    const header = document.createElement('div');
    header.className = 'collapsible-header';
    if (isOpen) {
        header.className += ' active';
    }
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    
    const icon = document.createElement('i');
    icon.className = 'icon fas fa-chevron-down';
    
    header.appendChild(titleSpan);
    header.appendChild(icon);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'collapsible-content';
    
    const innerDiv = document.createElement('div');
    innerDiv.className = 'collapsible-inner';
    
    if (typeof content === 'string') {
        innerDiv.innerHTML = content;
    } else {
        innerDiv.appendChild(content);
    }
    
    contentDiv.appendChild(innerDiv);
    
    if (isOpen) {
        contentDiv.style.maxHeight = 'none'; // Will be updated after append
    }
    
    panel.appendChild(header);
    panel.appendChild(contentDiv);
    
    // Update max height if panel is open
    setTimeout(() => {
        if (isOpen && contentDiv.style.maxHeight === 'none') {
            contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
        }
    }, 10);
    
    return panel;
}
