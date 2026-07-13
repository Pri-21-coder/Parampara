// services/impactMetricsService.js
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

class ImpactMetricsService {
  constructor() {
    this.metrics = {};
    this.indicators = [];
    this.reports = [];
    this.goals = [];
    this.benchmarks = [];
    this.dataPoints = new Map();
    this.impactScores = new Map();
    
    this.init();
  }

  init() {
    this.loadIndicators();
    this.loadBenchmarks();
    this.loadSampleMetrics();
    this.loadGoals();
    console.log('✅ Impact Metrics Service initialized');
  }

  loadIndicators() {
    this.indicators = [
      {
        id: 'ind_1',
        name: 'Cultural Heritage Preservation Index',
        category: 'preservation',
        description: 'Measures the overall preservation of cultural heritage',
        formula: 'average of heritage item preservation scores',
        weight: 0.25,
        target: 85,
        unit: 'percentage'
      },
      {
        id: 'ind_2',
        name: 'Community Engagement Score',
        category: 'community',
        description: 'Measures community participation in cultural activities',
        formula: 'active members / total members * 100',
        weight: 0.20,
        target: 70,
        unit: 'percentage'
      },
      {
        id: 'ind_3',
        name: 'Knowledge Transmission Rate',
        category: 'education',
        description: 'How effectively cultural knowledge is being passed on',
        formula: 'apprentices / masters * 100',
        weight: 0.15,
        target: 60,
        unit: 'percentage'
      },
      {
        id: 'ind_4',
        name: 'Artisan Economic Impact',
        category: 'economic',
        description: 'Economic impact on artisan communities',
        formula: 'total sales / number of artisans',
        weight: 0.15,
        target: 50000,
        unit: 'currency'
      },
      {
        id: 'ind_5',
        name: 'Cultural Diversity Index',
        category: 'diversity',
        description: 'Measures diversity of cultural practices',
        formula: 'number of active traditions / total traditions * 100',
        weight: 0.10,
        target: 80,
        unit: 'percentage'
      },
      {
        id: 'ind_6',
        name: 'Documentation Completeness',
        category: 'documentation',
        description: 'How well cultural heritage is documented',
        formula: 'documented items / total items * 100',
        weight: 0.10,
        target: 90,
        unit: 'percentage'
      },
      {
        id: 'ind_7',
        name: 'Youth Participation Rate',
        category: 'community',
        description: 'Youth involvement in cultural activities',
        formula: 'youth participants / total participants * 100',
        weight: 0.05,
        target: 40,
        unit: 'percentage'
      }
    ];
  }

  loadBenchmarks() {
    this.benchmarks = [
      {
        id: 'bench_1',
        name: 'UNESCO Intangible Heritage Benchmark',
        description: 'Standards set by UNESCO for intangible heritage preservation',
        categories: ['preservation', 'community', 'education'],
        values: {
          preservation: 85,
          community: 70,
          education: 60
        },
        source: 'UNESCO'
      },
      {
        id: 'bench_2',
        name: 'National Cultural Policy Standards',
        description: 'Standards from national cultural policy',
        categories: ['preservation', 'economic', 'diversity'],
        values: {
          preservation: 80,
          economic: 45000,
          diversity: 75
        },
        source: 'Government'
      },
      {
        id: 'bench_3',
        name: 'Global Heritage Fund Standards',
        description: 'Standards from Global Heritage Fund',
        categories: ['preservation', 'community', 'documentation'],
        values: {
          preservation: 90,
          community: 75,
          documentation: 85
        },
        source: 'Global Heritage Fund'
      }
    ];
  }

  loadSampleMetrics() {
    this.metrics = {
      overall: {
        preservationScore: 72,
        communityScore: 65,
        economicScore: 38000,
        educationScore: 55,
        diversityScore: 70,
        documentationScore: 60,
        youthScore: 35,
        lastUpdated: new Date().toISOString()
      },
      historical: [
        { quarter: 'Q1 2024', preservation: 68, community: 60, economic: 35000, education: 50 },
        { quarter: 'Q2 2024', preservation: 70, community: 62, economic: 36500, education: 52 },
        { quarter: 'Q3 2024', preservation: 72, community: 65, economic: 38000, education: 55 },
        { quarter: 'Q4 2024', preservation: 74, community: 68, economic: 40000, education: 58 }
      ],
      byCategory: {
        preservation: {
          total: 72,
          items: [
            { name: 'Kantha Embroidery', score: 78 },
            { name: 'Dokra Metal Casting', score: 65 },
            { name: 'Madhubani Painting', score: 82 },
            { name: 'Baul Music', score: 45 },
            { name: 'Terracotta Architecture', score: 55 }
          ]
        },
        community: {
          total: 65,
          items: [
            { name: 'Kolkata Heritage Society', score: 75 },
            { name: 'Rajasthan Arts Collective', score: 80 },
            { name: 'Kerala Cultural Forum', score: 60 },
            { name: 'Bihar Heritage Foundation', score: 45 }
          ]
        }
      },
      trends: {
        improving: ['preservation', 'economic', 'community'],
        declining: ['education', 'documentation'],
        stable: ['diversity', 'youth']
      }
    };
  }

  loadGoals() {
    this.goals = [
      {
        id: 'goal_1',
        name: 'Improve Heritage Preservation',
        indicator: 'Cultural Heritage Preservation Index',
        target: 85,
        current: 72,
        deadline: '2025-12-31',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'goal_2',
        name: 'Increase Community Engagement',
        indicator: 'Community Engagement Score',
        target: 75,
        current: 65,
        deadline: '2025-06-30',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'goal_3',
        name: 'Document All Heritage Items',
        indicator: 'Documentation Completeness',
        target: 90,
        current: 60,
        deadline: '2025-12-31',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'goal_4',
        name: 'Youth Involvement Program',
        indicator: 'Youth Participation Rate',
        target: 50,
        current: 35,
        deadline: '2025-09-30',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'goal_5',
        name: 'Artisan Economic Empowerment',
        indicator: 'Artisan Economic Impact',
        target: 60000,
        current: 38000,
        deadline: '2026-06-30',
        status: 'planned',
        createdAt: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Calculate impact metrics
   */
  async calculateImpact(data = null) {
    console.log('📊 Calculating impact metrics...');

    if (data) {
      // Use provided data
      this.metrics = data;
    }

    // Calculate weighted impact score
    const impactScore = this.calculateImpactScore();
    
    // Calculate indicator scores
    const indicatorScores = this.calculateIndicatorScores();
    
    // Calculate trends
    const trends = this.calculateTrends();

    const impact = {
      overallScore: impactScore,
      indicatorScores,
      trends,
      benchmarks: this.compareToBenchmarks(indicatorScores),
      goals: this.trackGoals(),
      timestamp: new Date().toISOString()
    };

    // Store impact score
    this.impactScores.set(Date.now(), impact);

    return impact;
  }

  /**
   * Calculate impact score
   */
  calculateImpactScore() {
    const metrics = this.metrics.overall;
    
    const scores = {
      preservation: metrics.preservationScore / 100,
      community: metrics.communityScore / 100,
      economic: Math.min(metrics.economicScore / 50000, 1),
      education: metrics.educationScore / 100,
      diversity: metrics.diversityScore / 100,
      documentation: metrics.documentationScore / 100,
      youth: metrics.youthScore / 100
    };

    const weights = {
      preservation: 0.25,
      community: 0.20,
      economic: 0.15,
      education: 0.15,
      diversity: 0.10,
      documentation: 0.10,
      youth: 0.05
    };

    let totalScore = 0;
    for (const [key, score] of Object.entries(scores)) {
      totalScore += score * (weights[key] || 0);
    }

    return Math.round(totalScore * 100);
  }

  /**
   * Calculate indicator scores
   */
  calculateIndicatorScores() {
    const metrics = this.metrics.overall;
    
    return this.indicators.map(indicator => {
      let value, score;
      
      switch (indicator.id) {
        case 'ind_1':
          value = metrics.preservationScore;
          score = (value / indicator.target) * 100;
          break;
        case 'ind_2':
          value = metrics.communityScore;
          score = (value / indicator.target) * 100;
          break;
        case 'ind_3':
          value = metrics.educationScore;
          score = (value / indicator.target) * 100;
          break;
        case 'ind_4':
          value = metrics.economicScore;
          score = Math.min((value / indicator.target) * 100, 100);
          break;
        case 'ind_5':
          value = metrics.diversityScore;
          score = (value / indicator.target) * 100;
          break;
        case 'ind_6':
          value = metrics.documentationScore;
          score = (value / indicator.target) * 100;
          break;
        case 'ind_7':
          value = metrics.youthScore;
          score = (value / indicator.target) * 100;
          break;
        default:
          value = 0;
          score = 0;
      }

      return {
        id: indicator.id,
        name: indicator.name,
        category: indicator.category,
        value: Math.round(value),
        target: indicator.target,
        score: Math.min(Math.round(score), 100),
        status: this.getStatus(score)
      };
    });
  }

  /**
   * Get status based on score
   */
  getStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'poor';
    return 'critical';
  }

  /**
   * Calculate trends
   */
  calculateTrends() {
    const historical = this.metrics.historical || [];
    if (historical.length < 2) return [];

    const trends = [];
    const indicators = ['preservation', 'community', 'economic', 'education'];

    indicators.forEach(indicator => {
      const values = historical.map(h => h[indicator] || 0);
      const trend = this.calculateTrend(values);
      
      if (trend !== null) {
        trends.push({
          indicator,
          trend,
          direction: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
          percentage: Math.abs(Math.round(trend * 100))
        });
      }
    });

    return trends;
  }

  /**
   * Calculate trend from values
   */
  calculateTrend(values) {
    if (values.length < 2) return null;
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * values[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;
    
    return slope / avgY;
  }

  /**
   * Compare to benchmarks
   */
  compareToBenchmarks(indicatorScores) {
    const comparisons = [];

    this.benchmarks.forEach(benchmark => {
      const score = {};
      let totalMatch = 0;
      let totalBenchmark = 0;

      benchmark.categories.forEach(category => {
        const indicator = indicatorScores.find(i => i.category === category);
        if (indicator) {
          const benchValue = benchmark.values[category] || 0;
          const indValue = indicator.value || 0;
          score[category] = {
            value: indValue,
            benchmark: benchValue,
            gap: indValue - benchValue,
            percentage: benchValue > 0 ? Math.round((indValue / benchValue) * 100) : 0
          };
          totalMatch += indValue;
          totalBenchmark += benchValue;
        }
      });

      comparisons.push({
        benchmark: benchmark.name,
        source: benchmark.source,
        scores: score,
        overall: {
          match: Math.round(totalMatch),
          benchmark: Math.round(totalBenchmark),
          gap: Math.round(totalMatch - totalBenchmark),
          percentage: totalBenchmark > 0 ? Math.round((totalMatch / totalBenchmark) * 100) : 0
        }
      });
    });

    return comparisons;
  }

  /**
   * Track goals
   */
  trackGoals() {
    return this.goals.map(goal => {
      const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
      const remaining = goal.target - goal.current;
      const daysRemaining = this.getDaysRemaining(goal.deadline);

      return {
        ...goal,
        progress,
        remaining,
        daysRemaining,
        status: this.getGoalStatus(progress, daysRemaining),
        isComplete: progress >= 100
      };
    });
  }

  /**
   * Get days remaining
   */
  getDaysRemaining(deadline) {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  /**
   * Get goal status
   */
  getGoalStatus(progress, daysRemaining) {
    if (progress >= 100) return 'completed';
    if (daysRemaining <= 0) return 'overdue';
    if (progress >= 75) return 'on_track';
    if (progress >= 50) return 'in_progress';
    return 'behind_schedule';
  }

  /**
   * Generate report
   */
  async generateReport(type = 'full', filters = {}) {
    console.log(`📄 Generating ${type} report...`);

    const impact = await this.calculateImpact();
    const report = {
      id: `report_${Date.now()}_${uuidv4().slice(0, 8)}`,
      type,
      generatedAt: new Date().toISOString(),
      filters,
      sections: {}
    };

    switch (type) {
      case 'summary':
        report.sections = {
          summary: this.generateSummary(impact),
          keyMetrics: this.generateKeyMetrics(impact),
          goals: this.trackGoals()
        };
        break;
      case 'detailed':
        report.sections = {
          summary: this.generateSummary(impact),
          keyMetrics: this.generateKeyMetrics(impact),
          indicators: impact.indicatorScores,
          benchmarks: impact.benchmarks,
          goals: this.trackGoals(),
          trends: impact.trends
        };
        break;
      case 'executive':
        report.sections = {
          executiveSummary: this.generateExecutiveSummary(impact),
          highlights: this.generateHighlights(impact),
          recommendations: this.generateRecommendations(impact)
        };
        break;
      default: // full
        report.sections = {
          summary: this.generateSummary(impact),
          keyMetrics: this.generateKeyMetrics(impact),
          indicators: impact.indicatorScores,
          benchmarks: impact.benchmarks,
          goals: this.trackGoals(),
          trends: impact.trends,
          details: this.metrics,
          recommendations: this.generateRecommendations(impact)
        };
    }

    this.reports.push(report);
    return report;
  }

  /**
   * Generate summary
   */
  generateSummary(impact) {
    return {
      overallScore: impact.overallScore,
      status: this.getStatus(impact.overallScore),
      timestamp: impact.timestamp,
      numberOfIndicators: impact.indicatorScores.length,
      onTrack: impact.indicatorScores.filter(i => i.status === 'excellent' || i.status === 'good').length,
      needsImprovement: impact.indicatorScores.filter(i => i.status === 'poor' || i.status === 'critical').length
    };
  }

  /**
   * Generate key metrics
   */
  generateKeyMetrics(impact) {
    const metrics = this.metrics.overall;
    return {
      preservationScore: metrics.preservationScore,
      communityScore: metrics.communityScore,
      economicScore: metrics.economicScore,
      educationScore: metrics.educationScore,
      diversityScore: metrics.diversityScore,
      documentationScore: metrics.documentationScore,
      youthScore: metrics.youthScore
    };
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(impact) {
    return {
      title: 'Cultural Heritage Impact Report',
      generated: new Date().toISOString(),
      overview: `Overall cultural heritage impact score is ${impact.overallScore}%`,
      status: this.getStatus(impact.overallScore),
      keyFindings: this.generateKeyFindings(impact),
      recommendations: this.generateRecommendations(impact)
    };
  }

  /**
   * Generate highlights
   */
  generateHighlights(impact) {
    const highlights = [];
    const indicators = impact.indicatorScores;

    // Best performing indicators
    const best = [...indicators].sort((a, b) => b.score - a.score).slice(0, 3);
    best.forEach(i => {
      highlights.push({
        type: 'strength',
        title: `Strong ${i.name}`,
        description: `${i.name} is at ${i.value} out of ${i.target}, with a score of ${i.score}%`
      });
    });

    // Areas needing improvement
    const worst = [...indicators].sort((a, b) => a.score - b.score).slice(0, 3);
    worst.forEach(i => {
      highlights.push({
        type: 'opportunity',
        title: `Improve ${i.name}`,
        description: `${i.name} is at ${i.value} out of ${i.target}, with a score of ${i.score}%`
      });
    });

    return highlights;
  }

  /**
   * Generate key findings
   */
  generateKeyFindings(impact) {
    const findings = [];
    const indicators = impact.indicatorScores;

    indicators.forEach(i => {
      if (i.score >= 80) {
        findings.push(`✅ ${i.name} is excellent at ${i.value} (${i.score}%)`);
      } else if (i.score >= 60) {
        findings.push(`📊 ${i.name} is good at ${i.value} (${i.score}%)`);
      } else if (i.score >= 40) {
        findings.push(`⚠️ ${i.name} needs improvement at ${i.value} (${i.score}%)`);
      } else {
        findings.push(`🔴 ${i.name} is critical at ${i.value} (${i.score}%)`);
      }
    });

    return findings;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(impact) {
    const recommendations = [];
    const indicators = impact.indicatorScores;

    indicators.forEach(i => {
      if (i.score < 60) {
        recommendations.push({
          indicator: i.name,
          current: i.value,
          target: i.target,
          recommendation: this.getRecommendation(i),
          priority: i.score < 40 ? 'high' : 'medium'
        });
      }
    });

    // Add benchmark-based recommendations
    impact.benchmarks.forEach(benchmark => {
      if (benchmark.overall.percentage < 80) {
        recommendations.push({
          indicator: 'Overall Performance',
          current: benchmark.overall.match,
          target: benchmark.overall.benchmark,
          recommendation: `Meet ${benchmark.benchmark} standards (${benchmark.source})`,
          priority: 'medium'
        });
      }
    });

    return recommendations;
  }

  /**
   * Get recommendation for indicator
   */
  getRecommendation(indicator) {
    const recommendations = {
      'Cultural Heritage Preservation Index': 'Increase preservation efforts and documentation',
      'Community Engagement Score': 'Launch community outreach programs',
      'Knowledge Transmission Rate': 'Establish mentorship and apprenticeship programs',
      'Artisan Economic Impact': 'Improve market access and fair trade practices',
      'Cultural Diversity Index': 'Promote diverse cultural practices',
      'Documentation Completeness': 'Accelerate documentation efforts',
      'Youth Participation Rate': 'Develop youth engagement programs'
    };
    return recommendations[indicator.name] || 'Implement improvement strategies';
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Update metrics
   */
  updateMetrics(metricData) {
    this.metrics = { ...this.metrics, ...metricData };
    return this.metrics;
  }

  /**
   * Get reports
   */
  getReports(filters = {}) {
    let filtered = [...this.reports];

    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    if (filters.startDate) {
      filtered = filtered.filter(r => new Date(r.generatedAt) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(r => new Date(r.generatedAt) <= new Date(filters.endDate));
    }

    return filtered;
  }

  /**
   * Get report by ID
   */
  getReport(reportId) {
    return this.reports.find(r => r.id === reportId);
  }

  /**
   * Get goals
   */
  getGoals(status = null) {
    if (status) {
      return this.goals.filter(g => g.status === status);
    }
    return this.goals;
  }

  /**
   * Create goal
   */
  createGoal(goalData) {
    const goal = {
      id: `goal_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...goalData,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.goals.push(goal);
    return goal;
  }

  /**
   * Update goal
   */
  updateGoal(goalId, updates) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    Object.assign(goal, updates);
    goal.updatedAt = new Date().toISOString();
    return goal;
  }

  /**
   * Get benchmarks
   */
  getBenchmarks() {
    return this.benchmarks;
  }

  /**
   * Get indicators
   */
  getIndicators() {
    return this.indicators;
  }

  /**
   * Get impact score history
   */
  getImpactHistory(limit = 10) {
    const history = Array.from(this.impactScores.entries())
      .map(([timestamp, data]) => ({
        timestamp: new Date(parseInt(timestamp)).toISOString(),
        score: data.overallScore,
        indicators: data.indicatorScores
      }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);

    return history;
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalReports = this.reports.length;
    const totalGoals = this.goals.length;
    const completedGoals = this.goals.filter(g => g.status === 'completed').length;
    const totalIndicators = this.indicators.length;
    const totalBenchmarks = this.benchmarks.length;

    const impact = this.calculateImpactScore();

    return {
      totalReports,
      totalGoals,
      completedGoals,
      inProgressGoals: this.goals.filter(g => g.status === 'in_progress').length,
      totalIndicators,
      totalBenchmarks,
      overallImpact: impact,
      lastReport: this.reports.length > 0 ? this.reports[this.reports.length - 1] : null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export data
   */
  exportData(format = 'json') {
    const data = {
      metrics: this.metrics,
      indicators: this.indicators,
      goals: this.goals,
      benchmarks: this.benchmarks,
      reports: this.reports.slice(-5),
      impactHistory: this.getImpactHistory(20)
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  /**
   * Convert to CSV
   */
  convertToCSV(data) {
    let csv = 'Metric,Value,Target,Score\n';
    
    // Add metrics
    if (data.metrics && data.metrics.overall) {
      const m = data.metrics.overall;
      csv += `Preservation Score,${m.preservationScore},85,${Math.round((m.preservationScore/85)*100)}\n`;
      csv += `Community Score,${m.communityScore},70,${Math.round((m.communityScore/70)*100)}\n`;
      csv += `Economic Score,${m.economicScore},50000,${Math.round((m.economicScore/50000)*100)}\n`;
    }

    // Add goals
    if (data.goals) {
      csv += '\nGoal,Current,Target,Progress\n';
      data.goals.forEach(g => {
        csv += `${g.name},${g.current},${g.target},${Math.round((g.current/g.target)*100)}%\n`;
      });
    }

    return csv;
  }
}

module.exports = ImpactMetricsService;