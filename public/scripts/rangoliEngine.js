// public/scripts/rangoliEngine.js

class RangoliGenerator {
  constructor() {
    this.container = document.getElementById('svg-container');
    this.symSlider = document.getElementById('symmetry');
    this.layerSlider = document.getElementById('layers');
    this.primaryColor = document.getElementById('primary-color');
    this.secondaryColor = document.getElementById('secondary-color');
    this.motifShape = document.getElementById('motif-shape');
    
    this.config = {
      symmetry: 8,
      layers: 4,
      primary: '#E91E63',
      secondary: '#FFC107',
      motif: 'petal'
    };

    this.init();
  }

  init() {
    // Event listeners
    const update = (e) => {
      this.config[e.target.id.split('-')[0]] = e.target.value; // very basic mapping, let's be explicit
      this.updateConfig();
      this.render();
    };

    this.symSlider.addEventListener('input', (e) => {
      document.getElementById('sym-val').innerText = e.target.value;
      this.updateConfig();
      this.render();
    });

    this.layerSlider.addEventListener('input', (e) => {
      document.getElementById('layer-val').innerText = e.target.value;
      this.updateConfig();
      this.render();
    });

    this.primaryColor.addEventListener('input', update);
    this.secondaryColor.addEventListener('input', update);
    this.motifShape.addEventListener('change', update);

    document.getElementById('btn-generate').addEventListener('click', () => this.randomize());
    document.getElementById('btn-save').addEventListener('click', () => this.saveDesign());
    document.getElementById('btn-export-svg').addEventListener('click', () => this.exportSVG());
    document.getElementById('btn-export-png').addEventListener('click', () => this.exportPNG());

    this.updateConfig();
    this.render();
    this.loadGallery();
  }

  updateConfig() {
    this.config = {
      symmetry: parseInt(this.symSlider.value),
      layers: parseInt(this.layerSlider.value),
      primary: this.primaryColor.value,
      secondary: this.secondaryColor.value,
      motif: this.motifShape.value
    };
  }

  randomize() {
    const colors = ['#E91E63', '#FFC107', '#9C27B0', '#00BCD4', '#4CAF50', '#FF5722', '#3F51B5'];
    this.primaryColor.value = colors[Math.floor(Math.random() * colors.length)];
    this.secondaryColor.value = colors[Math.floor(Math.random() * colors.length)];
    this.symSlider.value = Math.floor(Math.random() * 9 + 2) * 2; // 4 to 20
    this.layerSlider.value = Math.floor(Math.random() * 5) + 3; // 3 to 7
    
    const shapes = ['petal', 'circle', 'diamond', 'triangle', 'mixed'];
    this.motifShape.value = shapes[Math.floor(Math.random() * shapes.length)];
    
    document.getElementById('sym-val').innerText = this.symSlider.value;
    document.getElementById('layer-val').innerText = this.layerSlider.value;
    
    this.updateConfig();
    this.render();
  }

  generateMotif(type, cx, cy, radius, color, rotation) {
    let svg = '';
    const r2 = radius * 0.4;
    
    switch(type) {
      case 'petal':
        svg = `<path d="M ${cx} ${cy - radius} C ${cx + r2} ${cy - radius/2}, ${cx + r2} ${cy}, ${cx} ${cy} C ${cx - r2} ${cy}, ${cx - r2} ${cy - radius/2}, ${cx} ${cy - radius} Z" fill="${color}" transform="rotate(${rotation} ${cx} ${cy})"/>`;
        break;
      case 'circle':
        svg = `<circle cx="${cx}" cy="${cy - radius/2}" r="${radius/3}" fill="${color}" transform="rotate(${rotation} ${cx} ${cy})"/>`;
        break;
      case 'diamond':
        svg = `<polygon points="${cx},${cy - radius} ${cx + r2},${cy - radius/2} ${cx},${cy} ${cx - r2},${cy - radius/2}" fill="${color}" transform="rotate(${rotation} ${cx} ${cy})"/>`;
        break;
      case 'triangle':
        svg = `<polygon points="${cx},${cy - radius} ${cx + r2},${cy} ${cx - r2},${cy}" fill="${color}" transform="rotate(${rotation} ${cx} ${cy})"/>`;
        break;
      case 'mixed':
        // Alternating based on some math or just random per layer
        const t = (radius % 3 === 0) ? 'petal' : (radius % 2 === 0 ? 'diamond' : 'circle');
        return this.generateMotif(t, cx, cy, radius, color, rotation);
    }
    return svg;
  }

  generateSVGString() {
    const size = 500;
    const cx = size / 2;
    const cy = size / 2;
    const { symmetry, layers, primary, secondary, motif } = this.config;

    let svgContent = '';
    
    // Central bindu (dot)
    svgContent += `<circle cx="${cx}" cy="${cy}" r="15" fill="${primary}" />`;

    // Generate concentric layers
    for (let l = 1; l <= layers; l++) {
      const radius = l * (200 / layers);
      const color = l % 2 === 0 ? primary : secondary;
      
      const angleStep = 360 / symmetry;
      // Stagger odd layers by half an angle for interlocked look
      const offset = l % 2 === 0 ? 0 : angleStep / 2;
      
      for (let i = 0; i < symmetry; i++) {
        const angle = (i * angleStep) + offset;
        svgContent += this.generateMotif(motif, cx, cy, radius, color, angle);
        
        // Add decorative dots between motifs
        if (layers > 2) {
            const dotAngle = angle + (angleStep/2);
            svgContent += `<circle cx="${cx}" cy="${cy - radius + 10}" r="4" fill="${l % 2 === 0 ? secondary : primary}" transform="rotate(${dotAngle} ${cx} ${cy})"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" class="rangoli-svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="${size}" height="${size}" fill="transparent" />
      <g filter="url(#glow)">
        ${svgContent}
      </g>
    </svg>`;
  }

  render() {
    this.container.innerHTML = this.generateSVGString();
  }

  async saveDesign() {
    const title = document.getElementById('design-title').innerText;
    const svgData = this.generateSVGString();
    
    const btn = document.getElementById('btn-save');
    btn.innerText = 'Saving...';

    try {
      const csrfRes = await fetch('/api/csrf-token');
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;

      const res = await fetch('/api/rangoli/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          title,
          config: this.config,
          svgData
        })
      });
      const data = await res.json();
      if (data.success) {
        btn.innerText = '✅ Saved!';
        this.loadGallery();
        setTimeout(() => btn.innerText = '💾 Save Design', 2000);
      } else {
        throw new Error('Save failed');
      }
    } catch(err) {
      console.error(err);
      btn.innerText = '❌ Error';
      setTimeout(() => btn.innerText = '💾 Save Design', 2000);
    }
  }

  async loadGallery() {
    const gallery = document.getElementById('gallery-grid');
    try {
      const res = await fetch('/api/rangoli/explore');
      const data = await res.json();
      
      if (data.success && data.designs.length > 0) {
        gallery.innerHTML = '';
        data.designs.reverse().forEach(d => {
          const el = document.createElement('div');
          el.className = 'gallery-item';
          el.innerHTML = `
            ${d.svgData}
            <h4>${d.title}</h4>
          `;
          el.addEventListener('click', () => {
            // Load this config
            this.config = d.config;
            this.symSlider.value = this.config.symmetry;
            this.layerSlider.value = this.config.layers;
            this.primaryColor.value = this.config.primary;
            this.secondaryColor.value = this.config.secondary;
            this.motifShape.value = this.config.motif;
            document.getElementById('sym-val').innerText = this.config.symmetry;
            document.getElementById('layer-val').innerText = this.config.layers;
            document.getElementById('design-title').innerText = d.title;
            this.render();
          });
          gallery.appendChild(el);
        });
      } else {
        gallery.innerHTML = '<p class="loading-msg">No designs yet. Be the first!</p>';
      }
    } catch (err) {
      console.error("Failed to load gallery", err);
    }
  }

  exportSVG() {
    const svg = this.generateSVGString();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parampara_rangoli.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPNG() {
    const svg = this.generateSVGString();
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw SVG
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      
      const a = document.createElement('a');
      a.download = 'parampara_rangoli.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.rangoliGenerator = new RangoliGenerator();
});
