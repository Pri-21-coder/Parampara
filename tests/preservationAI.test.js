const assert = require('assert');
const PreservationAIService = require('../server/services/preservationAIService');

console.log('🧪 Starting PreservationAIService unit tests...');

const service = new PreservationAIService();

// Test 1: Initialization verification
console.log('- Testing Service Initialization...');
const items = service.getHeritageItems();
assert.strictEqual(items.length > 0, true, 'Should load heritage items');

// Test 2: Risk Score calculation
console.log('- Testing Risk Score Calculation...');
const testItem = items[0];
const riskScore = service.calculateRiskScore(testItem);
assert.strictEqual(typeof riskScore, 'number', 'Risk score should be a number');
assert.strictEqual(riskScore >= 0 && riskScore <= 100, true, 'Risk score must be between 0 and 100');

// Test 3: Risk Level classification
console.log('- Testing Risk Level Classification...');
assert.strictEqual(service.getRiskLevel(85), 'critical', 'Risk score 85 should be critical');
assert.strictEqual(service.getRiskLevel(65), 'high', 'Risk score 65 should be high');
assert.strictEqual(service.getRiskLevel(45), 'medium', 'Risk score 45 should be medium');
assert.strictEqual(service.getRiskLevel(20), 'low', 'Risk score 20 should be low');

// Test 4: Identify Risk Factors
console.log('- Testing Risk Factors Identification...');
const factors = service.identifyRiskFactors(testItem);
assert.strictEqual(Array.isArray(factors), true, 'Risk factors should be an array');

// Test 5: Generate Recommendations
console.log('- Testing Preservation Recommendations...');
const recs = service.generateRecommendations(testItem, riskScore, factors);
assert.strictEqual(Array.isArray(recs), true, 'Recommendations should be an array');
if (recs.length > 0) {
  assert.strictEqual(typeof recs[0], 'object', 'Recommendation item should be an object');
  assert.strictEqual(typeof recs[0].description, 'string', 'Recommendation item should have a description');
}

// Test 6: Risk Assessment Retrieval
console.log('- Testing Risk Assessment Retrieval...');
const assessment = service.assessRisk(testItem.id);
assert.strictEqual(assessment.heritageId, testItem.id, 'Assessment should match the requested heritage item');
assert.strictEqual(assessment.riskScore, riskScore, 'Assessment risk score should match calculated risk score');

// Test 7: Progress Tracking
console.log('- Testing Progress Tracking...');
const progressData = {
  stage: 'Documentation',
  percentage: 45,
  status: 'in_progress',
  notes: 'High-res scanning completed'
};
service.trackProgress(testItem.id, progressData);

const progress = service.getProgress(testItem.id);
assert.strictEqual(progress.length > 0, true, 'Progress records array should not be empty');
assert.strictEqual(progress[0].percentage, 45, 'Progress percentage should be saved');
assert.strictEqual(progress[0].status, 'in_progress', 'Progress status should be saved');

// Test 8: Resource Allocation
console.log('- Testing Resource Allocation...');
const resourceData = {
  budget: 5000,
  experts: ['Art Historian', '3D Scanning Expert'],
  equipment: ['3D Scanner', 'Polarizing Camera']
};
service.allocateResources(testItem.id, resourceData);

const allocations = service.getResourceAllocations(testItem.id);
assert.strictEqual(allocations.length > 0, true, 'Resource allocations array should not be empty');
assert.strictEqual(allocations[0].budget, 5000, 'Allocated budget should match');
assert.strictEqual(allocations[0].experts.length, 2, 'Allocated experts count should match');

// Test 9: Stats and AI Insights
console.log('- Testing Preservation Stats & AI Insights...');
const stats = service.getPreservationStats();
assert.strictEqual(typeof stats, 'object', 'Stats should be an object');
assert.strictEqual(stats.totalItems, items.length, 'Total items count should match loaded items count');

const insights = service.getAIInsights();
assert.strictEqual(typeof insights, 'object', 'AI Insights should be an object');
assert.strictEqual(Array.isArray(insights.urgentActions), true, 'urgentActions should be an array');

console.log('✅ All PreservationAIService tests passed successfully!');
