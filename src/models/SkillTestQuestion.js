const mongoose = require('mongoose');

const SkillTestQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctIndex: {
      type: Number,
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillTest',
      required: true,
    },
  },
  { timestamps: true },
);

SkillTestQuestionSchema.statics.getSkillTestQuestionFields = function () {
  return ['_id', 'question', 'options', 'correctIndex', 'testId'];
};

const SkillTestQuestion = mongoose.model(
  'SkillTestQuestion',
  SkillTestQuestionSchema,
);

module.exports = SkillTestQuestion;
