const mongoose = require('mongoose');

const SkillTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

SkillTestSchema.statics.getSkillTestFields = function () {
  return ['_id', 'name', 'isPublished', 'image', 'description'];
};

const SkillTest = mongoose.model('SkillTest', SkillTestSchema);

module.exports = SkillTest;
