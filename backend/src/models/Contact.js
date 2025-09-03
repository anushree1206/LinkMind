import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  isImportant: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true, trim: true },
  jobTitle: { type: String },
  company: { type: String },
  email: { type: String },
  phone: { type: String },
  linkedInUrl: { type: String },
  relationshipStrength: { type: String, enum: ['Weak', 'Medium', 'Strong', 'At-Risk'], default: 'Medium' },
  tags: [{ type: String }],
  location: { type: String },
  lastContacted: { type: Date },
  notes: [noteSchema],
  interactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interaction' }],
  isFavorite: { type: Boolean, default: false },
  source: { type: String, enum: ['linkedin-sync', 'manual'], default: 'manual' },
  preferences: {
    preferredChannel: { type: String, enum: ['Email', 'LinkedIn'], default: 'Email' }
  }
}, { timestamps: true });

// Virtuals used by controllers
contactSchema.virtual('totalInteractions').get(function () {
  return Array.isArray(this.interactions) ? this.interactions.length : 0;
});

contactSchema.virtual('daysSinceLastContact').get(function () {
  if (!this.lastContacted) return null;
  const diffMs = Date.now() - new Date(this.lastContacted).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

contactSchema.virtual('contactAge').get(function () {
  if (!this.createdAt) return null;
  const diffMs = Date.now() - new Date(this.createdAt).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

// Static: find by user with filters (matches controller usage)
contactSchema.statics.findByUserWithFilters = async function (userId, filters = {}) {
  const query = { user: userId };

  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: 'i' } },
      { company: { $regex: filters.search, $options: 'i' } },
      { jobTitle: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } }
    ];
  }

  if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  if (filters.relationshipStrength) {
    query.relationshipStrength = filters.relationshipStrength;
  }

  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }

  return this.find(query).sort({ updatedAt: -1 });
};

// Static: aggregate user stats (matches controller usage)
contactSchema.statics.getUserStats = async function (userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalContacts: { $sum: 1 },
        strongRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Strong'] }, 1, 0] } },
        mediumRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Medium'] }, 1, 0] } },
        weakRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'Weak'] }, 1, 0] } },
        atRiskRelationships: { $sum: { $cond: [{ $eq: ['$relationshipStrength', 'At-Risk'] }, 1, 0] } },
        contactsWithInteractions: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$interactions', []] } }, 0] }, 1, 0] } }
      }
    },
    { $project: { _id: 0 } }
  ]);
};

// Instance: add a note
contactSchema.methods.addNote = async function (content, isImportant = false) {
  this.notes.push({ content, isImportant });
  await this.save();
  return this.notes;
};

// Instance: add an interaction (updates lastContacted)
contactSchema.methods.addInteraction = async function (type, content, outcome = 'Neutral', followUpDate = null) {
  this.lastContacted = new Date();
  await this.save();
};

// Instance: update relationship strength
contactSchema.methods.updateRelationshipStrength = async function (strength) {
  this.relationshipStrength = strength;
  await this.save();
  return this.relationshipStrength;
};

export default mongoose.model('Contact', contactSchema);
