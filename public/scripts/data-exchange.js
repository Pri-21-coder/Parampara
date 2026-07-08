document.addEventListener('DOMContentLoaded', () => {
  setupExport();
  setupImport();
});

function setupExport() {
  const form = document.getElementById('export-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (value) params.append(key, value);
    }

    const format = formData.get('format');
    const url = `/api/data-exchange/export?${params.toString()}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error('Export failed');

      // Handle download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `parampara-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();

      // Optional: show success toast or message
    } catch (error) {
      console.error('Export Error:', error);
      alert('Failed to export data. Please try again.');
    }
  });
}

function setupImport() {
  const form = document.getElementById('import-form');
  const fileInput = document.getElementById('import-file');
  const dropArea = document.getElementById('file-drop-area');
  const fileNameDisplay = document.getElementById('file-name-display');
  const resultsDiv = document.getElementById('import-results');
  const successStat = document.getElementById('stat-success');
  const failedStat = document.getElementById('stat-failed');
  const errorsContainer = document.getElementById('import-errors-container');
  const errorsList = document.getElementById('import-errors-list');
  const downloadTemplateBtn = document.getElementById('download-template');

  // File drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropArea.addEventListener(
      eventName,
      () => dropArea.classList.add('dragover'),
      false
    );
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropArea.addEventListener(
      eventName,
      () => dropArea.classList.remove('dragover'),
      false
    );
  });

  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      fileInput.files = files;
      updateFileName(files[0].name);
    }
  });

  fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      updateFileName(this.files[0].name);
    }
  });

  function updateFileName(name) {
    fileNameDisplay.textContent = `Selected file: ${name}`;
  }

  // Download Template
  downloadTemplateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const headers = 'title,type,location,description,tags,lat,lng\n';
    const sample =
      'Sample Tradition,story,Pune,"A great story",culture,18.5204,73.8567\n';
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parampara-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  });

  // Submit Form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!fileInput.files.length) {
      alert('Please select a file to import.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const btn = document.getElementById('btn-import');
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;

    try {
      const csrfRes = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfRes.json();

      const response = await fetch('/api/data-exchange/import', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      // Display Results
      resultsDiv.classList.remove('hidden');
      successStat.textContent = data.summary.successful;
      failedStat.textContent = data.summary.failed;

      if (data.summary.errors && data.summary.errors.length > 0) {
        errorsContainer.classList.remove('hidden');
        errorsList.innerHTML = '';
        data.summary.errors.forEach((err) => {
          const li = document.createElement('li');
          li.textContent = `Row ${err.row}: ${err.message}`;
          errorsList.appendChild(li);
        });
      } else {
        errorsContainer.classList.add('hidden');
      }

      // Reset form if entirely successful
      if (data.summary.failed === 0) {
        form.reset();
        fileNameDisplay.textContent = '';
      }
    } catch (error) {
      console.error('Import Error:', error);
      alert(`Import error: ${error.message}`);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}
