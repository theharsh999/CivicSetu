import mongoose from 'mongoose';
import { STATUSES, PRIORITIES, PRIORITY_LIST, SLA_HOURS } from '../utils/constants.js';

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: STATUSES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorRole: {
      type: String,
      default: 'system',
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const remarkSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      default: 'image/jpeg',
    },
    size: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: true }
);

const grievanceSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Grievance title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Grievance description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Grievance category is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Responsible department is required'],
      index: true,
    },
    categorySource: {
      type: String,
      enum: ['citizen', 'ai', 'officer'],
      default: 'citizen',
    },
    priority: {
      type: String,
      enum: PRIORITY_LIST,
      default: PRIORITIES.MEDIUM,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Submitted',
      index: true,
    },
    location: {
      address: {
        type: String,
        trim: true,
        default: '',
      },
      ward: {
        type: String,
        trim: true,
        default: 'Ward 1 - Central',
      },
      landmark: {
        type: String,
        trim: true,
        default: '',
      },
      coordinates: {
        lat: {
          type: Number,
          default: 19.0760, // Default to metropolitan municipal coords
        },
        lng: {
          type: Number,
          default: 72.8777,
        },
      },
    },
    attachments: [attachmentSchema],
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    aiAnalysis: {
      department: { type: String, default: '' },
      category: { type: String, default: '' },
      priority: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
      keywords: { type: [String], default: [] },
      urgencySignals: { type: [String], default: [] },
      needsManualReview: { type: Boolean, default: false },
      summary: { type: String, default: '' },
      reasoning: { type: String, default: '' },
      alternatives: [
        {
          department: { type: String },
          category: { type: String },
          confidence: { type: Number },
        },
      ],
      provider: { type: String, default: 'rule-based-nlp-v1' },
      isMock: { type: Boolean, default: true },
      analyzedAt: { type: Date, default: null },
      overridden: { type: Boolean, default: false },
      overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      overriddenAt: { type: Date, default: null },
      overrideReason: { type: String, default: '' },
    },
    timeline: [timelineEntrySchema],
    remarks: [remarkSchema],
    sla: {
      dueAt: {
        type: Date,
        required: true,
      },
      breached: {
        type: Boolean,
        default: false,
      },
      escalationLevel: {
        type: Number,
        default: 0,
      },
      escalatedAt: {
        type: Date,
        default: null,
      },
      warnedAtRisk: {
        type: Boolean,
        default: false,
      },
    },
    resolution: {
      summary: {
        type: String,
        trim: true,
        default: '',
      },
      proofImages: {
        type: [String],
        default: [],
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      resolvedAt: {
        type: Date,
        default: null,
      },
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        trim: true,
        default: '',
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
grievanceSchema.index({ createdAt: -1 });
grievanceSchema.index({ 'location.ward': 1 });
grievanceSchema.index({ title: 'text', description: 'text' });

export const Grievance = mongoose.model('Grievance', grievanceSchema);
export default Grievance;
