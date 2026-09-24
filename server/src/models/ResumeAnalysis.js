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
      characterCount: { type: Number, default: 0 },
      sentenceCount: { type: Number, default: 0 },
      paragraphCount: { type: Number, default: 0 },
      avgSentenceLengthWords: { type: Number, default: 0 },
      estimatedReadingTimeMinutes: { type: Number, default: 0 },
      pdfVersion: { type: String, default: 'unknown' },
    },
    score: {
      totalScore: { type: Number, required: true },
      grade: { type: String, required: true },
      summary: { type: String, required: true },
      breakdown: {
        skills: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 25 },
          percentage: { type: Number, default: 0 },
          status: { type: String },
          feedback: { type: String },
          matched: [{ type: String }],
          missing: [{ type: String }],
          extra: [{ type: String }],
          categoryBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
        },
        keywords: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          percentage: { type: Number, default: 0 },
          status: { type: String },
          feedback: { type: String },
          matched: [{ type: String }],
          missing: [{ type: String }],
          total: { type: Number, default: 0 },
          keywordDensityPercent: { type: Number, default: 0 },
        },
        experience: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          percentage: { type: Number, default: 0 },
          status: { type: String },
          feedback: { type: String },
          actionVerbsCount: { type: Number, default: 0 },
          actionVerbs: [{ type: String }],
          quantifiedMetricsCount: { type: Number, default: 0 },
          hasExperienceSection: { type: Boolean, default: false },
        },
        projects: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 15 },
          percentage: { type: Number, default: 0 },
          status: { type: String },
          feedback: { type: String },
          hasProjectsSection: { type: Boolean, default: false },
          hasRepoLinks: { type: Boolean, default: false },
        },
        ats: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 10 },
          percentage: { type: Number, default: 0 },
          status: { type: String },
          feedback: { type: String },
          detectedSections: [{ type: String }],
          contactDataFound: {
            email: { type: Boolean, default: false },
            phone: { type: Boolean, default: false },
            links: { type: Boolean, default: false },
          },
        },
        education: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 10 },
          percentage: { type: Number, default: 0 },
          status: { type: String },
          feedback: { type: String },
          hasEducationSection: { type: Boolean, default: false },
          hasDegreeIdentified: { type: Boolean, default: false },
        },
        // Legacy fallback properties
        sections: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          found: [{ type: String }],
        },
        contentDepth: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          wordCount: { type: Number, default: 0 },
        },
        readability: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 10 },
          avgSentenceLength: { type: Number, default: 0 },
        },
      },
    },
    semanticMatch: {
      similarityScore: { type: Number, default: 0 },
      method: { type: String, default: 'tfidf-cosine' },
      semanticConfidence: { type: String, default: 'Medium' },
      conceptualOverlapPercent: { type: Number, default: 0 },
      explanation: { type: String },
    },
    aiAdvice: {
      provider: { type: String, default: 'Heuristic Career Advisor (Built-in)' },
      isMock: { type: Boolean, default: true },
      summary: { type: String },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      improvements: [{ type: String }],
      recommendations: [{ type: String }],
      bulletSuggestions: [{ type: String }],
      suggestedRoles: [
        {
          role: { type: String },
          matchPercentage: { type: Number },
          reason: { type: String },
        },
      ],
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
