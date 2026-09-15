import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    fileSizeFormatted: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      default: 'General Analysis',
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    metrics: {
      wordCount: { type: Number, default: 0 },
      charCount: { type: Number, default: 0 },
      pageCount: { type: Number, default: 1 },
      pdfVersion: { type: String, default: 'unknown' },
    },
    score: {
      totalScore: { type: Number, required: true },
      grade: { type: String, required: true },
      summary: { type: String, required: true },
      breakdown: {
        keywords: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 50 },
          total: { type: Number, default: 0 },
          matched: [{ type: String }],
          missing: [{ type: String }],
        },
        sections: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          found: [{ type: String }],
          missing: [{ type: String }],
        },
        contentDepth: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          wordCount: { type: Number, default: 0 },
          uniqueWords: { type: Number, default: 0 },
          lexicalDiversity: { type: Number, default: 0 },
        },
        readability: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 10 },
          avgSentenceLength: { type: Number, default: 0 },
          bulletPoints: { type: Number, default: 0 },
        },
      },
    },
    status: {
      type: String,
      enum: ['analyzed', 'archived'],
      default: 'analyzed',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user query performance and chronological ordering
resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const ResumeAnalysis =
  mongoose.models.ResumeAnalysis || mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

export default ResumeAnalysis;
