/**
 * Native Browser Sandboxing for Village Themes
 * Uses Shadow DOM to encapsulate custom CSS safely.
 */
class VillageThemeContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }); 
        // We use closed mode for strict isolation, meaning the parent JS cannot easily access shadow root elements.
        
        // Setup initial container
        const container = document.createElement('div');
        container.className = 'village-theme-wrapper';
        container.innerHTML = `<slot></slot>`;
        
        // Placeholder for the custom style
        this.styleTag = document.createElement('style');
        
        this.shadowRoot.appendChild(this.styleTag);
        this.shadowRoot.appendChild(container);
    }

    static get observedAttributes() {
        return ['village-id'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'village-id' && oldValue !== newValue) {
            this.loadTheme(newValue);
        }
    }

    connectedCallback() {
        if (!this.hasAttribute('village-id')) {
            console.warn('<village-theme> requires a village-id attribute.');
        } else {
            this.loadTheme(this.getAttribute('village-id'));
        }
    }

    async loadTheme(villageId) {
        this._currentVillageId = villageId; // Track the latest requested ID
        try {
            const response = await fetch(`/api/themes/${encodeURIComponent(villageId)}`);
            if (this._currentVillageId !== villageId) return; // Prevent stale overwrites

            if (response.ok) {
                const data = await response.json();
                if (data && data.css) {
                    this.applyTheme(data.css);
                } else {
                    this.applyTheme(''); // Clear theme
                }
            } else {
                console.info(`No custom theme found for village: ${villageId}`);
                this.applyTheme(''); // Clear theme
            }
        } catch (error) {
            console.error('Error fetching village theme:', error);
        }
    }

    applyTheme(cssString) {
        // Safe injection inside Shadow DOM boundary
        this.styleTag.textContent = cssString;
    }
}

// Define the custom element
customElements.define('village-theme', VillageThemeContainer);
