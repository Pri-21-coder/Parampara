// services/jobProcessorService.js
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

class JobProcessorService {
  constructor() {
    this.jobs = [];
    this.queue = [];
    this.workers = [];
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000;
    this.jobTypes = {};
    this.activeWorkers = 0;
    this.maxWorkers = 5;
    
    this.init();
  }

  init() {
    this.registerDefaultJobTypes();
    this.startWorker();
    this.startCleanup();
    console.log('✅ Job Processor Service initialized');
  }

  registerDefaultJobTypes() {
    this.registerJobType('csv_import', this.processCSVImport);
    this.registerJobType('json_export', this.processJSONExport);
    this.registerJobType('image_optimization', this.processImageOptimization);
    this.registerJobType('report_generation', this.processReportGeneration);
    this.registerJobType('cache_rebuild', this.processCacheRebuild);
    this.registerJobType('email_send', this.processEmailSend);
    this.registerJobType('data_sync', this.processDataSync);
  }

  /**
   * Register a job type
   */
  registerJobType(type, handler) {
    this.jobTypes[type] = handler;
  }

  /**
   * Add job to queue
   */
  addJob(type, data, options = {}) {
    const job = {
      id: `job_${Date.now()}_${uuidv4().slice(0, 8)}`,
      type,
      data,
      status: 'pending',
      priority: options.priority || 'normal',
      attempts: 0,
      maxRetries: options.maxRetries || this.maxRetries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      result: null,
      progress: 0,
      metadata: options.metadata || {},
      scheduledFor: options.scheduledFor || null
    };

    this.jobs.push(job);
    this.queue.push(job.id);
    
    // Process immediately if worker is free
    if (this.activeWorkers < this.maxWorkers) {
      this.processNextJob();
    }

    return job;
  }

  /**
   * Process next job
   */
  async processNextJob() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    this.activeWorkers++;
    
    try {
      const jobId = this.queue.shift();
      const job = this.getJob(jobId);
      
      if (!job) {
        this.activeWorkers--;
        this.isProcessing = false;
        return;
      }

      if (job.status === 'cancelled') {
        this.activeWorkers--;
        this.isProcessing = false;
        return;
      }

      // Check if scheduled for future
      if (job.scheduledFor && new Date(job.scheduledFor) > new Date()) {
        // Requeue for later
        setTimeout(() => {
          this.queue.unshift(jobId);
          this.isProcessing = false;
          this.activeWorkers--;
          this.processNextJob();
        }, 5000);
        return;
      }

      await this.executeJob(job);
    } catch (error) {
      console.error('Error processing job:', error);
    } finally {
      this.activeWorkers--;
      this.isProcessing = false;
      
      // Process next job if available
      if (this.queue.length > 0 && this.activeWorkers < this.maxWorkers) {
        this.processNextJob();
      }
    }
  }

  /**
   * Execute a job
   */
  async executeJob(job) {
    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    job.attempts++;
    job.updatedAt = new Date().toISOString();

    // Update store
    this.updateJobInStore(job);

    try {
      const handler = this.jobTypes[job.type];
      
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      // Execute with progress callback
      const result = await handler(job.data, (progress) => {
        job.progress = progress;
        this.updateJobInStore(job);
      });

      job.status = 'completed';
      job.result = result;
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.updatedAt = new Date().toISOString();

    } catch (error) {
      job.error = error.message;
      job.status = 'failed';
      job.updatedAt = new Date().toISOString();

      // Retry logic
      if (job.attempts < job.maxRetries) {
        job.status = 'pending';
        job.updatedAt = new Date().toISOString();
        
        // Requeue with delay
        setTimeout(() => {
          this.queue.push(job.id);
          if (this.activeWorkers < this.maxWorkers) {
            this.processNextJob();
          }
        }, this.retryDelay * job.attempts);
      }
    }

    this.updateJobInStore(job);
  }

  /**
   * Update job in store
   */
  updateJobInStore(job) {
    const index = this.jobs.findIndex(j => j.id === job.id);
    if (index !== -1) {
      this.jobs[index] = job;
    }
    
    if (!store.jobs) {
      store.jobs = [];
    }
    
    const storeIndex = store.jobs.findIndex(j => j.id === job.id);
    if (storeIndex !== -1) {
      store.jobs[storeIndex] = job;
    } else {
      store.jobs.push(job);
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId) {
    return this.jobs.find(j => j.id === jobId);
  }

  /**
   * Get jobs with filters
   */
  getJobs(filters = {}) {
    let filtered = [...this.jobs];

    if (filters.status) {
      filtered = filtered.filter(j => j.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(j => j.type === filters.type);
    }

    if (filters.priority) {
      filtered = filtered.filter(j => j.priority === filters.priority);
    }

    if (filters.startDate) {
      filtered = filtered.filter(j => new Date(j.createdAt) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(j => new Date(j.createdAt) <= new Date(filters.endDate));
    }

    // Sort by priority and date
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    filtered.sort((a, b) => {
      const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityCompare !== 0) return priorityCompare;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId) {
    const job = this.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'processing') {
      job.status = 'cancelled';
      job.updatedAt = new Date().toISOString();
      this.updateJobInStore(job);
      return job;
    }

    if (job.status === 'pending') {
      // Remove from queue
      const queueIndex = this.queue.indexOf(jobId);
      if (queueIndex !== -1) {
        this.queue.splice(queueIndex, 1);
      }
      job.status = 'cancelled';
      job.updatedAt = new Date().toISOString();
      this.updateJobInStore(job);
      return job;
    }

    throw new Error('Job cannot be cancelled');
  }

  /**
   * Retry a failed job
   */
  retryJob(jobId) {
    const job = this.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'failed') {
      throw new Error('Only failed jobs can be retried');
    }

    job.status = 'pending';
    job.attempts = 0;
    job.error = null;
    job.updatedAt = new Date().toISOString();
    this.updateJobInStore(job);
    this.queue.push(job.id);
    
    if (this.activeWorkers < this.maxWorkers) {
      this.processNextJob();
    }

    return job;
  }

  /**
   * Get job statistics
   */
  getStats() {
    const total = this.jobs.length;
    const pending = this.jobs.filter(j => j.status === 'pending').length;
    const processing = this.jobs.filter(j => j.status === 'processing').length;
    const completed = this.jobs.filter(j => j.status === 'completed').length;
    const failed = this.jobs.filter(j => j.status === 'failed').length;
    const cancelled = this.jobs.filter(j => j.status === 'cancelled').length;

    const typeCounts = {};
    this.jobs.forEach(j => {
      typeCounts[j.type] = (typeCounts[j.type] || 0) + 1;
    });

    const avgProcessingTime = this.calculateAvgProcessingTime();

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      cancelled,
      queueLength: this.queue.length,
      activeWorkers: this.activeWorkers,
      maxWorkers: this.maxWorkers,
      typeCounts,
      avgProcessingTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate average processing time
   */
  calculateAvgProcessingTime() {
    const completedJobs = this.jobs.filter(j => 
      j.status === 'completed' && j.startedAt && j.completedAt
    );
    
    if (completedJobs.length === 0) return 0;
    
    const totalTime = completedJobs.reduce((sum, j) => {
      const start = new Date(j.startedAt).getTime();
      const end = new Date(j.completedAt).getTime();
      return sum + (end - start);
    }, 0);
    
    return Math.round(totalTime / completedJobs.length);
  }

  /**
   * Start worker
   */
  startWorker() {
    console.log('👷 Worker started');
    setInterval(() => {
      if (this.queue.length > 0 && this.activeWorkers < this.maxWorkers) {
        this.processNextJob();
      }
    }, 1000);
  }

  /**
   * Start cleanup job
   */
  startCleanup() {
    setInterval(() => {
      const oldJobs = this.jobs.filter(j => {
        const age = Date.now() - new Date(j.createdAt).getTime();
        return age > 7 * 24 * 60 * 60 * 1000 && 
               (j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled');
      });
      
      if (oldJobs.length > 0) {
        oldJobs.forEach(job => {
          const index = this.jobs.indexOf(job);
          if (index !== -1) {
            this.jobs.splice(index, 1);
          }
        });
        console.log(`🧹 Cleaned up ${oldJobs.length} old jobs`);
      }
    }, 24 * 60 * 60 * 1000);
  }

  // ==================== DEFAULT JOB HANDLERS ====================

  /**
   * Process CSV import
   */
  async processCSVImport(data, updateProgress) {
    updateProgress(10);
    // Simulate processing
    await this.sleep(1000);
    updateProgress(30);
    await this.sleep(1000);
    updateProgress(60);
    await this.sleep(1000);
    updateProgress(80);
    await this.sleep(1000);
    updateProgress(95);
    
    return {
      imported: data.rows || 100,
      errors: 0,
      message: 'CSV import completed successfully'
    };
  }

  /**
   * Process JSON export
   */
  async processJSONExport(data, updateProgress) {
    updateProgress(20);
    await this.sleep(1000);
    updateProgress(40);
    await this.sleep(1000);
    updateProgress(70);
    await this.sleep(1000);
    updateProgress(90);
    
    return {
      exported: data.count || 1000,
      filename: `export_${Date.now()}.json`,
      message: 'JSON export completed successfully'
    };
  }

  /**
   * Process image optimization
   */
  async processImageOptimization(data, updateProgress) {
    updateProgress(15);
    await this.sleep(1000);
    updateProgress(35);
    await this.sleep(1000);
    updateProgress(55);
    await this.sleep(1000);
    updateProgress(75);
    await this.sleep(1000);
    updateProgress(90);
    
    return {
      optimized: data.images || 50,
      savedSpace: (data.images || 50) * 0.3,
      message: 'Image optimization completed'
    };
  }

  /**
   * Process report generation
   */
  async processReportGeneration(data, updateProgress) {
    updateProgress(10);
    await this.sleep(1000);
    updateProgress(30);
    await this.sleep(1000);
    updateProgress(50);
    await this.sleep(1000);
    updateProgress(70);
    await this.sleep(1000);
    updateProgress(90);
    
    return {
      reportId: `report_${Date.now()}`,
      format: data.format || 'pdf',
      pages: data.pages || 20,
      message: 'Report generated successfully'
    };
  }

  /**
   * Process cache rebuild
   */
  async processCacheRebuild(data, updateProgress) {
    updateProgress(20);
    await this.sleep(1000);
    updateProgress(40);
    await this.sleep(1000);
    updateProgress(60);
    await this.sleep(1000);
    updateProgress(80);
    await this.sleep(1000);
    updateProgress(95);
    
    return {
      cacheKeys: data.keys || 500,
      size: `${(data.keys || 500) * 0.1}MB`,
      message: 'Cache rebuilt successfully'
    };
  }

  /**
   * Process email send
   */
  async processEmailSend(data, updateProgress) {
    updateProgress(25);
    await this.sleep(1000);
    updateProgress(50);
    await this.sleep(1000);
    updateProgress(75);
    await this.sleep(1000);
    updateProgress(95);
    
    return {
      sent: true,
      recipients: data.recipients || 1,
      message: 'Email sent successfully'
    };
  }

  /**
   * Process data sync
   */
  async processDataSync(data, updateProgress) {
    updateProgress(10);
    await this.sleep(1000);
    updateProgress(30);
    await this.sleep(1000);
    updateProgress(50);
    await this.sleep(1000);
    updateProgress(70);
    await this.sleep(1000);
    updateProgress(90);
    
    return {
      synced: data.items || 1000,
      conflicts: 0,
      message: 'Data sync completed successfully'
    };
  }

  /**
   * Utility: Sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = JobProcessorService;