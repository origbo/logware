/**
 * Mock MongoDB Models
 * This file provides mock models for testing and development
 */

class MockModel {
  constructor(modelName, schema = {}) {
    this.modelName = modelName;
    this.schema = schema;
    this.data = [];
    this.lastId = 0;
  }

  async find(query = {}) {
    // This is a very simplistic implementation that doesn't actually filter
    // In a real implementation, this would apply the query filters
    return this.data;
  }

  async findById(id) {
    return this.data.find(item => item._id === id);
  }

  async countDocuments() {
    return this.data.length;
  }

  async aggregate() {
    // Mock implementation that just returns empty results
    // In a real implementation, this would process the aggregation pipeline
    return [];
  }

  async save(document) {
    const id = document._id || `mock_${this.modelName}_${++this.lastId}`;
    const newDoc = { ...document, _id: id };
    this.data.push(newDoc);
    return newDoc;
  }
}

// Create models map to store our mock models
const models = new Map();

// Mock mongoose model function that returns our mock models
const model = (name, schema) => {
  if (!models.has(name)) {
    models.set(name, new MockModel(name, schema));
  }
  return models.get(name);
};

// Export mock mongoose functionality
module.exports = {
  model,
  Schema: function(schema) {
    return schema;
  },
  connect: async () => {
    console.log('Connected to mock MongoDB');
    return { connection: { host: 'mock' } };
  }
};
