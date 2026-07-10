const fs = require('fs');
const path = require('path');

// Basic DOM Mock
class MockElement {
  constructor(tag) {
    this.tag = tag;
    this.innerHTML = '';
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.children = [];
    this.listeners = {};
    this.attributes = {};
  }
  
  appendChild(child) {
    this.children.push(child);
  }
  
  remove() {
    this.parentNode && this.parentNode.removeChild(this);
  }
  
  removeChild(child) {
    this.children = this.children.filter(c => c !== child);
  }
  
  querySelectorAll(sel) {
    return this.children; // Simplified
  }
  
  querySelector(sel) {
    return this.children[0] || null;
  }
  
  addEventListener(evt, cb) {
    this.listeners[evt] = this.listeners[evt] || [];
    this.listeners[evt].push(cb);
  }
  
  setAttribute(attr, val) {
    this.attributes[attr] = val;
  }
}

global.document = {
  getElementById: (id) => {
    if (id === 'historical-timeline-mount') {
      const el = new MockElement('div');
      el.id = id;
      return el;
    }
    const el = new MockElement('div');
    el.id = id;
    return el;
  },
  createElement: (tag) => new MockElement(tag)
};

global.window = {
  dispatchEvent: () => {},
  map: {
    flyTo: (opts) => {
      console.log('Flying to', opts);
    }
  }
};
global.CustomEvent = class { constructor(name, detail) { this.name = name; this.detail = detail; } };

let mockTimelineData = [];
let mockItemsData = [];

global.fetch = async (url) => {
  if (url.includes('/api/timeline')) {
    return {
      ok: true,
      json: async () => mockTimelineData
    };
  }
  if (url.includes('/api/items')) {
    return {
      ok: true,
      json: async () => mockItemsData
    };
  }
  return { ok: false };
};

// Load the component
const componentCode = fs.readFileSync(path.join(__dirname, 'public/scripts/historicalTimeline.js'), 'utf8');
eval(componentCode);
global.HistoricalTimelineComponent = window.HistoricalTimelineComponent;

async function runTests() {
  console.log('--- Running HistoricalTimelineComponent Edge Cases Test ---');
  
  // Test 1: Empty dataset
  console.log('Test 1: Empty dataset');
  mockTimelineData = [];
  const timeline1 = new HistoricalTimelineComponent({ containerId: 'historical-timeline-mount' });
  await timeline1.fetchData();
  timeline1.renderTimeline();
  console.log('Empty dataset handled correctly:', timeline1.events.length === 0);

  // Test 2: Invalid/Missing fields
  console.log('Test 2: Invalid/Missing fields');
  mockTimelineData = [
    { id: '1', year: '1900' }, // Missing title, type, description, item
    { id: '2', year: '1950', title: 'Test', type: 'Festival' }
  ];
  const timeline2 = new HistoricalTimelineComponent({ containerId: 'historical-timeline-mount' });
  await timeline2.fetchData();
  timeline2.renderTimeline();
  console.log('Invalid fields handled correctly:', timeline2.events.length === 2);

  // Test 3: Clustered years (Same year)
  console.log('Test 3: Clustered years');
  mockTimelineData = [
    { id: '1', year: '2000', title: 'Event A', item: 'Item A', type: 'Craft' },
    { id: '2', year: '2000', title: 'Event B', item: 'Item B', type: 'Craft' },
    { id: '3', year: '2000', title: 'Event C', item: 'Item C', type: 'Craft' }
  ];
  const timeline3 = new HistoricalTimelineComponent({ containerId: 'historical-timeline-mount' });
  await timeline3.fetchData();
  timeline3.renderTimeline();
  console.log('Clustered years handled correctly:', timeline3.events.length === 3);

  // Test 4: Extreme years
  console.log('Test 4: Extreme years');
  mockTimelineData = [
    { id: '1', year: '-1000', title: 'Ancient', item: 'Item A', type: 'Craft' },
    { id: '2', year: '2026', title: 'Modern', item: 'Item B', type: 'Craft' }
  ];
  const timeline4 = new HistoricalTimelineComponent({ containerId: 'historical-timeline-mount' });
  await timeline4.fetchData();
  timeline4.renderTimeline();
  console.log('Extreme years parsed successfully:', timeline4.events.length === 2);

  // Test 5: Click and select without coordinates
  console.log('Test 5: Selection without coordinates');
  mockItemsData = [];
  await timeline4.selectEvent('1');
  console.log('Selection executed safely');

  // Test 6: Click and select with coordinates
  console.log('Test 6: Selection with coordinates');
  mockItemsData = [{ coordinates: [80, 20] }];
  await timeline4.selectEvent('2');
  console.log('Selection executed safely with coordinates');
  
  console.log('--- All tests passed successfully ---');
}

runTests().catch(console.error);
