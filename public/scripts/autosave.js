/**
 * FormAutoSave
 * A modular utility to automatically save form drafts to LocalStorage.
 */
class FormAutoSave {
  /**
   * Initialize auto-save for a form.
   * @param {HTMLFormElement} formElement - The form element to track.
   * @param {Object} options - Configuration options.
   * @param {string} options.id - Unique identifier for the form (used as LocalStorage key).
   * @param {number} [options.debounceMs=1000] - Milliseconds to debounce the save operation.
   */
  constructor(formElement, options = {}) {
    if (!formElement) {
      console.warn('FormAutoSave: formElement is required.');
      return;
    }

    this.form = formElement;
    this.id = options.id || this.form.id || 'default-form';
    this.storageKey = `parampara_autosave_${this.id}`;
    this.debounceMs = options.debounceMs || 1000;
    this.timeoutId = null;

    this.init();
  }

  init() {
    // Check if there's an existing draft
    this.checkExistingDraft();

    // Setup UI indicators
    this.setupIndicator();

    // Attach event listeners
    this.form.addEventListener('input', this.handleChange.bind(this));
    this.form.addEventListener('change', this.handleChange.bind(this));
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  setupIndicator() {
    // Create indicator element
    this.indicator = document.createElement('div');
    this.indicator.className = 'autosave-indicator';
    this.indicator.style.display = 'none';

    // Find submit button to place the indicator near it
    const submitBtn = this.form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(this.indicator, submitBtn.nextSibling);
    } else {
      this.form.appendChild(this.indicator);
    }
  }

  updateIndicator(status, message) {
    this.indicator.style.display = 'inline-flex';
    this.indicator.className = `autosave-indicator ${status}`;
    
    let icon = '';
    if (status === 'saving') icon = '<i class="ti ti-loader fa-spin"></i>';
    else if (status === 'saved') icon = '<i class="ti ti-check"></i>';
    else if (status === 'error') icon = '<i class="ti ti-alert-triangle"></i>';

    this.indicator.innerHTML = `${icon} <span>${message}</span>`;

    // Hide saved message after 3 seconds
    if (status === 'saved') {
      setTimeout(() => {
        if (this.indicator.classList.contains('saved')) {
          this.indicator.style.opacity = '0';
          setTimeout(() => {
            this.indicator.style.display = 'none';
            this.indicator.style.opacity = '1';
          }, 300);
        }
      }, 3000);
    }
  }

  handleChange(e) {
    // Ignore password fields
    if (e.target.type === 'password') return;

    this.updateIndicator('saving', 'Saving draft...');

    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.saveDraft();
    }, this.debounceMs);
  }

  saveDraft() {
    try {
      const formData = new FormData(this.form);
      const data = {};
      let hasData = false;

      for (const [key, value] of formData.entries()) {
        const input = this.form.elements[key];
        
        // Handle multiple select or checkboxes with same name
        if (data[key] !== undefined) {
          if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
          }
          data[key].push(value);
          if (value) hasData = true;
        } else {
          // Special handling for file inputs - store filename instead of Blob
          if (value instanceof File) {
             if(value.name) {
               data[key] = { type: 'file', name: value.name };
               hasData = true;
             }
          } else {
            data[key] = value;
            if (value && String(value).trim() !== '') hasData = true;
          }
        }
      }

      if (!hasData) {
        this.clearDraft();
        this.indicator.style.display = 'none';
        return;
      }

      // Add timestamp
      const draft = {
        timestamp: new Date().toISOString(),
        data: data
      };

      localStorage.setItem(this.storageKey, JSON.stringify(draft));
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.updateIndicator('saved', `Draft saved at ${time}`);
    } catch (error) {
      console.error('FormAutoSave Error:', error);
      this.updateIndicator('error', 'Failed to save draft (Storage full?)');
    }
  }

  checkExistingDraft() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const draft = JSON.parse(saved);
        this.showRecoveryPrompt(draft);
      }
    } catch (error) {
      console.error('Failed to parse saved draft', error);
      localStorage.removeItem(this.storageKey);
    }
  }

  showRecoveryPrompt(draft) {
    const time = new Date(draft.timestamp).toLocaleString();
    
    const banner = document.createElement('div');
    banner.className = 'autosave-recovery-banner';
    
    let hasFiles = false;
    for (const key in draft.data) {
        if(draft.data[key] && typeof draft.data[key] === 'object' && draft.data[key].type === 'file') {
            hasFiles = true;
            break;
        }
    }

    let fileNote = hasFiles ? '<br><small>Note: You will need to re-select your file(s).</small>' : '';

    banner.innerHTML = `
      <div class="autosave-recovery-content">
        <i class="ti ti-clock autosave-recovery-icon"></i>
        <div>
          <strong>Unsaved draft found</strong>
          <p style="margin:0; font-size: 0.9em;">You have an unsaved draft from ${time}. ${fileNote}</p>
        </div>
      </div>
      <div class="autosave-recovery-actions">
        <button type="button" class="autosave-btn-discard">Discard</button>
        <button type="button" class="autosave-btn-restore">Restore Draft</button>
      </div>
    `;

    this.form.parentNode.insertBefore(banner, this.form);

    banner.querySelector('.autosave-btn-restore').addEventListener('click', () => {
      this.restoreDraft(draft.data);
      banner.remove();
    });

    banner.querySelector('.autosave-btn-discard').addEventListener('click', () => {
      this.clearDraft();
      banner.remove();
    });
  }

  restoreDraft(data) {
    for (const key in data) {
      const input = this.form.elements[key];
      if (!input) continue;
      
      const value = data[key];

      // Handle NodeList (radio buttons or checkboxes with same name)
      if (input instanceof NodeList) {
         input.forEach(el => {
             if (el.type === 'checkbox' || el.type === 'radio') {
                if (Array.isArray(value)) {
                    el.checked = value.includes(el.value);
                } else {
                    el.checked = (el.value === value);
                }
             }
         });
      } else {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = Boolean(value);
        } else if (input.type === 'file') {
            // Cannot restore file inputs, but we already warned the user
        } else {
          input.value = value;
        }
      }
    }
    this.updateIndicator('saved', 'Draft restored');
  }

  clearDraft() {
    localStorage.removeItem(this.storageKey);
  }

  handleSubmit() {
    clearTimeout(this.timeoutId);
    this.clearDraft();
    this.indicator.style.display = 'none';
  }
}

// Make it available globally
window.FormAutoSave = FormAutoSave;
