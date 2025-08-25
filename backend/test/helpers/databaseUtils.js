/**
 * Database Test Utilities - Handles test database setup, cleanup, and isolation
 * Ensures clean test environment and proper data isolation
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

class DatabaseTestUtils {
  constructor() {
    this.mongoServer = null;
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Setup test database connection
   */
  async setupTestDatabase() {
    try {
      // Use in-memory MongoDB for testing
      if (process.env.NODE_ENV === 'test') {
        this.mongoServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'hospital-test-db'
          }
        });

        const mongoUri = this.mongoServer.getUri();

        await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });

        this.connection = mongoose.connection;
        this.isConnected = true;

        console.log('✓ Test database connected successfully');
        return mongoUri;
      } else {
        // Use dedicated test database
        const testDbUri = process.env.TEST_DB_URI || 'mongodb://localhost:27017/hospital-test-db';

        await mongoose.connect(testDbUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });

        this.connection = mongoose.connection;
        this.isConnected = true;

        console.log('✓ Test database connected successfully');
        return testDbUri;
      }
    } catch (error) {
      console.error('✗ Test database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Clean database between tests
   */
  async cleanDatabase() {
    try {
      if (!this.isConnected) {
        await this.setupTestDatabase();
      }

      const collections = await mongoose.connection.db.collections();

      for (const collection of collections) {
        await collection.deleteMany({});
      }

      console.log('✓ Database cleaned successfully');
    } catch (error) {
      console.error('✗ Database cleanup failed:', error.message);
      throw error;
    }
  }

  /**
   * Close test database connection
   */
  async closeDatabase() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
      }

      if (this.mongoServer) {
        await this.mongoServer.stop();
      }

      this.isConnected = false;
      console.log('✓ Test database disconnected successfully');
    } catch (error) {
      console.error('✗ Database disconnection failed:', error.message);
      throw error;
    }
  }

  /**
   * Create database snapshot for rollback testing
   */
  async createSnapshot() {
    try {
      const snapshot = {};
      const collections = await mongoose.connection.db.collections();

      for (const collection of collections) {
        const data = await collection.find({}).toArray();
        snapshot[collection.collectionName] = data;
      }

      return snapshot;
    } catch (error) {
      console.error('✗ Snapshot creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Restore database from snapshot
   */
  async restoreSnapshot(snapshot) {
    try {
      await this.cleanDatabase();

      for (const [collectionName, data] of Object.entries(snapshot)) {
        if (data.length > 0) {
          await mongoose.connection.db.collection(collectionName).insertMany(data);
        }
      }

      console.log('✓ Database restored from snapshot');
    } catch (error) {
      console.error('✗ Snapshot restoration failed:', error.message);
      throw error;
    }
  }

  /**
   * Seed test data into database
   */
  async seedTestData(seedData) {
    try {
      for (const [modelName, documents] of Object.entries(seedData)) {
        const Model = mongoose.model(modelName);

        if (Array.isArray(documents)) {
          await Model.insertMany(documents);
        } else {
          await Model.create(documents);
        }
      }

      console.log('✓ Test data seeded successfully');
    } catch (error) {
      console.error('✗ Test data seeding failed:', error.message);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const stats = {};
      const collections = await mongoose.connection.db.collections();

      for (const collection of collections) {
        const count = await collection.countDocuments();
        stats[collection.collectionName] = count;
      }

      return stats;
    } catch (error) {
      console.error('✗ Failed to get database stats:', error.message);
      throw error;
    }
  }

  /**
   * Check if collection exists
   */
  async collectionExists(collectionName) {
    try {
      const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
      return collections.length > 0;
    } catch (error) {
      console.error('✗ Collection existence check failed:', error.message);
      return false;
    }
  }

  /**
   * Drop specific collection
   */
  async dropCollection(collectionName) {
    try {
      const exists = await this.collectionExists(collectionName);

      if (exists) {
        await mongoose.connection.db.collection(collectionName).drop();
        console.log(`✓ Collection '${collectionName}' dropped`);
      }
    } catch (error) {
      console.error(`✗ Failed to drop collection '${collectionName}':`, error.message);
      throw error;
    }
  }

  /**
   * Create database indexes for testing
   */
  async createTestIndexes() {
    try {
      // User email index
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });

      // Appointment indexes
      await mongoose.connection.db.collection('appointments').createIndex({ patientId: 1, appointmentDate: 1 });
      await mongoose.connection.db.collection('appointments').createIndex({ doctorId: 1, appointmentDate: 1 });

      // Medical records indexes
      await mongoose.connection.db.collection('medicalrecords').createIndex({ patientId: 1, visitDate: -1 });
      await mongoose.connection.db.collection('medicalrecords').createIndex({ recordNumber: 1 }, { unique: true });

      console.log('✓ Test indexes created successfully');
    } catch (error) {
      console.error('✗ Test index creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate database integrity
   */
  async validateDatabaseIntegrity() {
    try {
      const issues = [];

      // Check for orphaned records
      const appointments = await mongoose.connection.db.collection('appointments').find({}).toArray();
      const users = await mongoose.connection.db.collection('users').find({}).toArray();
      const userIds = users.map(user => user._id.toString());

      for (const appointment of appointments) {
        if (!userIds.includes(appointment.patientId.toString())) {
          issues.push(`Orphaned appointment: ${appointment._id} - patient not found`);
        }
        if (!userIds.includes(appointment.doctorId.toString())) {
          issues.push(`Orphaned appointment: ${appointment._id} - doctor not found`);
        }
      }

      // Check for duplicate emails
      const emailCounts = {};
      for (const user of users) {
        emailCounts[user.email] = (emailCounts[user.email] || 0) + 1;
      }

      for (const [email, count] of Object.entries(emailCounts)) {
        if (count > 1) {
          issues.push(`Duplicate email: ${email} (${count} occurrences)`);
        }
      }

      return {
        isValid: issues.length === 0,
        issues: issues
      };
    } catch (error) {
      console.error('✗ Database integrity validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  /**
   * Execute database transaction for testing
   */
  async executeTransaction(operations) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const results = [];
      for (const operation of operations) {
        const result = await operation(session);
        results.push(result);
      }

      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Monitor database performance during tests
   */
  async startPerformanceMonitoring() {
    const startTime = Date.now();
    const initialStats = await this.getDatabaseStats();

    return {
      startTime,
      initialStats,
      stop: async () => {
        const endTime = Date.now();
        const finalStats = await this.getDatabaseStats();

        return {
          duration: endTime - startTime,
          initialStats,
          finalStats,
          growth: this.calculateStatsGrowth(initialStats, finalStats)
        };
      }
    };
  }

  /**
   * Calculate stats growth between two snapshots
   */
  calculateStatsGrowth(initial, final) {
    const growth = {};

    for (const collection of new Set([...Object.keys(initial), ...Object.keys(final)])) {
      const initialCount = initial[collection] || 0;
      const finalCount = final[collection] || 0;
      growth[collection] = finalCount - initialCount;
    }

    return growth;
  }
}

// Export singleton instance
export default new DatabaseTestUtils();

module.exports = new DatabaseTestUtils();
