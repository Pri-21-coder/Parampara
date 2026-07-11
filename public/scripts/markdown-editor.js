/**
 * Parampara Advanced Markdown Editor
 * Replaces a standard textarea with a rich Markdown editor, live preview, 
 * toolbar, auto-save, and DOMPurify sanitization.
 */
class ParamparaMarkdownEditor {
  constructor(textareaId, options = {}) {
    this.textarea = document.getElementById(textareaId);
    if (!this.textarea) {
      console.error(`MarkdownEditor: Cannot find textarea with id '${textareaId}'`);
      return;
    }

    this.options = Object.assign({
      placeholder: 'Write your cultural content here using Markdown...',
      autoSave: true,
      autoSaveKey: `draft_${textareaId}`
    }, options);

    this.wrapper = null;
    this.previewPane = null;
    this.statusIndicator = null;
    this.saveTimeout = null;

    this.init();
  }

  async init() {
    await this.loadDependencies();
    this.buildUI();
    this.bindEvents();
    this.loadDraft();
    this.updatePreview();
  }

  async loadDependencies() {
    const loadScript = (src, globalVar) => {
      return new Promise((resolve, reject) => {
        if (window[globalVar]) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    try {
      await Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js', 'marked'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.3/purify.min.js', 'DOMPurify')
      ]);
      // Configure marked
      if (window.marked) {
        window.marked.setOptions({
          breaks: true,
          gfm: true
        });
      }
    } catch (e) {
      console.error("Failed to load Markdown dependencies.", e);
    }
  }

  buildUI() {
    // Hide original textarea
    this.textarea.style.display = 'none';

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'markdown-editor-wrapper';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'markdown-toolbar';
    toolbar.innerHTML = `
      <div class="markdown-toolbar-group">
        <button type="button" class="markdown-btn" data-action="bold" title="Bold (Ctrl+B)"><b>B</b></button>
        <button type="button" class="markdown-btn" data-action="italic" title="Italic (Ctrl+I)"><i>I</i></button>
      </div>
      <div class="markdown-toolbar-group">
        <button type="button" class="markdown-btn" data-action="h1" title="Heading 1">H1</button>
        <button type="button" class="markdown-btn" data-action="h2" title="Heading 2">H2</button>
        <button type="button" class="markdown-btn" data-action="h3" title="Heading 3">H3</button>
      </div>
      <div class="markdown-toolbar-group">
        <button type="button" class="markdown-btn" data-action="quote" title="Blockquote"><i class="ti ti-quote"></i></button>
        <button type="button" class="markdown-btn" data-action="code" title="Code Block"><i class="ti ti-code"></i></button>
      </div>
      <div class="markdown-toolbar-group">
        <button type="button" class="markdown-btn" data-action="link" title="Link (Ctrl+K)"><i class="ti ti-link"></i></button>
        <button type="button" class="markdown-btn" data-action="image" title="Image"><i class="ti ti-photo"></i></button>
      </div>
      <div class="markdown-status" id="md-status-${this.options.autoSaveKey}">
        <i class="ti ti-check"></i> Ready
      </div>
    `;

    // Create mobile tabs
    const tabs = document.createElement('div');
    tabs.className = 'markdown-tabs';
    tabs.innerHTML = `
      <button type="button" class="markdown-tab active" data-mode="write">Write</button>
      <button type="button" class="markdown-tab" data-mode="preview">Preview</button>
    `;

    // Create panels
    const panels = document.createElement('div');
    panels.className = 'markdown-panels mode-write';

    // Editor Pane
    const editorPane = document.createElement('div');
    editorPane.className = 'markdown-editor-pane';
    this.editorTextarea = document.createElement('textarea');
    this.editorTextarea.className = 'markdown-textarea';
    this.editorTextarea.placeholder = this.options.placeholder || this.textarea.placeholder;
    this.editorTextarea.value = this.textarea.value;
    editorPane.appendChild(this.editorTextarea);

    // Preview Pane
    this.previewPane = document.createElement('div');
    this.previewPane.className = 'markdown-preview-pane';
    
    panels.appendChild(editorPane);
    panels.appendChild(this.previewPane);

    // Assemble
    this.wrapper.appendChild(toolbar);
    this.wrapper.appendChild(tabs);
    this.wrapper.appendChild(panels);

    // Insert into DOM right after the original textarea
    this.textarea.parentNode.insertBefore(this.wrapper, this.textarea.nextSibling);

    this.statusIndicator = document.getElementById(`md-status-${this.options.autoSaveKey}`);
    this.panelsContainer = panels;
    
    // Bind Toolbar
    toolbar.querySelectorAll('.markdown-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.executeAction(btn.dataset.action);
      });
    });

    // Bind Tabs
    tabs.querySelectorAll('.markdown-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.querySelectorAll('.markdown-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        panels.className = `markdown-panels mode-${tab.dataset.mode}`;
      });
    });
  }

  bindEvents() {
    this.editorTextarea.addEventListener('input', () => {
      this.syncValue();
      this.triggerAutoSave();
    });

    this.editorTextarea.addEventListener('keydown', (e) => {
      // Keyboard Shortcuts
      if (e.ctrlKey || e.metaKey) {
        let action = null;
        if (e.key === 'b' || e.key === 'B') action = 'bold';
        else if (e.key === 'i' || e.key === 'I') action = 'italic';
        else if (e.key === 'k' || e.key === 'K') action = 'link';

        if (action) {
          e.preventDefault();
          this.executeAction(action);
        }
      }
    });

    // Clear draft on form submit
    if (this.textarea.form) {
      this.textarea.form.addEventListener('submit', () => {
        this.clearDraft();
      });
    }
  }

  syncValue() {
    this.textarea.value = this.editorTextarea.value;
    this.updatePreview();
  }

  updatePreview() {
    if (!window.marked || !window.DOMPurify) return;
    
    const rawMarkdown = this.editorTextarea.value;
    const rawHtml = window.marked.parse(rawMarkdown);
    const safeHtml = window.DOMPurify.sanitize(rawHtml);
    
    this.previewPane.innerHTML = safeHtml || '<span style="color:#aaa; font-style:italic;">Nothing to preview</span>';
  }

  executeAction(action) {
    const start = this.editorTextarea.selectionStart;
    const end = this.editorTextarea.selectionEnd;
    const text = this.editorTextarea.value;
    const selected = text.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    switch (action) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        cursorOffset = selected ? 0 : 2;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        cursorOffset = selected ? 0 : 1;
        break;
      case 'h1':
        replacement = `\n# ${selected || 'Heading 1'}\n`;
        cursorOffset = selected ? 0 : 3;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Heading 2'}\n`;
        cursorOffset = selected ? 0 : 4;
        break;
      case 'h3':
        replacement = `\n### ${selected || 'Heading 3'}\n`;
        cursorOffset = selected ? 0 : 5;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'block quote'}\n`;
        cursorOffset = selected ? 0 : 3;
        break;
      case 'code':
        replacement = `\n\`\`\`\n${selected || 'code here'}\n\`\`\`\n`;
        cursorOffset = selected ? 0 : 4;
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          replacement = `[${selected || 'link text'}](${url})`;
        } else {
          replacement = selected;
        }
        break;
      case 'image':
        const imgUrl = prompt('Enter Image URL:', 'https://');
        if (imgUrl) {
          replacement = `![${selected || 'alt text'}](${imgUrl})`;
        } else {
          replacement = selected;
        }
        break;
    }

    if (replacement !== selected) {
      this.editorTextarea.value = text.substring(0, start) + replacement + text.substring(end);
      this.editorTextarea.focus();
      if (cursorOffset > 0) {
        this.editorTextarea.setSelectionRange(start + cursorOffset, start + replacement.length - cursorOffset);
      } else {
        this.editorTextarea.setSelectionRange(start + replacement.length, start + replacement.length);
      }
      this.syncValue();
      this.triggerAutoSave();
    }
  }

  triggerAutoSave() {
    if (!this.options.autoSave) return;
    
    this.statusIndicator.innerHTML = '<i class="ti ti-loader ti-spin"></i> Saving...';
    
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      localStorage.setItem(this.options.autoSaveKey, this.editorTextarea.value);
      this.statusIndicator.innerHTML = '<i class="ti ti-check" style="color:green"></i> Saved to draft';
    }, 1000);
  }

  loadDraft() {
    if (!this.options.autoSave) return;
    const draft = localStorage.getItem(this.options.autoSaveKey);
    if (draft && !this.editorTextarea.value) {
      this.editorTextarea.value = draft;
      this.syncValue();
      this.statusIndicator.innerHTML = '<i class="ti ti-check"></i> Draft loaded';
    }
  }

  clearDraft() {
    if (this.options.autoSave) {
      localStorage.removeItem(this.options.autoSaveKey);
    }
  }
}

// Make it globally available
window.ParamparaMarkdownEditor = ParamparaMarkdownEditor;
