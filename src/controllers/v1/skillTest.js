const create = require('../create');
const SkillTest = require('../../models/SkillTest');
const SkillTestQuestion = require('../../models/SkillTestQuestion');
const validators = require('../../validators/skillTest');

module.exports = {
  postSkillTest: create(
    async (req, res) => {
      const { name, image, description } = req.body;

      const newSkillTest = new SkillTest({
        name,
        image,
        description,
      });

      const skillTest = await newSkillTest.save();

      res.json({ data: skillTest });
    },
    {
      validation: {
        validators: validators.postSkillTest,
        throwError: true,
      },
    },
  ),

  postSkillTestQuestion: create(
    async (req, res) => {
      const { testId } = req.params;
      const { question, options, correctIndex } = req.body;

      const newSkillTestQuestion = new SkillTestQuestion({
        question,
        options,
        correctIndex,
        testId,
      });

      const skillTestQuestion = await newSkillTestQuestion.save();

      res.json({ data: skillTestQuestion });
    },
    {
      validation: {
        validators: validators.postSkillTestQuestion,
        throwError: true,
      },
    },
  ),

  updateSkillTest: create(
    async (req, res) => {
      const { id } = req.params;
      const { name, image, description } = req.body;

      const skillTest = await SkillTest.findByIdAndUpdate(
        id,
        {
          name,
          image,
          description,
        },
        { new: true },
      );

      res.json({ data: skillTest });
    },
    {
      validation: {
        validators: validators.updateSkillTest,
        throwError: true,
      },
    },
  ),

  updateSkillTestQuestion: create(
    async (req, res) => {
      const { questionId } = req.params;

      const { options, correctIndex } = req.body;
      let optionsLength = options ? options.length : 0;

      const skillTestQuestion = await SkillTestQuestion.findById(questionId);

      if (!optionsLength) {
        optionsLength = skillTestQuestion.options.length;
      }

      if (correctIndex && (correctIndex < 0 || correctIndex >= optionsLength)) {
        return res.status(400).send('Bad request');
      }

      Object.keys(res.locals.inputBody).forEach((key) => {
        skillTestQuestion[key] = res.locals.inputBody[key];
      });

      await skillTestQuestion.save();

      return res.json({ data: skillTestQuestion });
    },
    {
      validation: {
        validators: validators.updateSkillTestQuestion,
        throwError: true,
      },
      inputs: ['question', 'options', 'correctIndex'],
    },
  ),

  publishSkillTest: create(async (req, res) => {
    const { testId } = req.params;

    await SkillTest.findByIdAndUpdate(
      testId,
      {
        isPublished: true,
      },
      { new: true },
    );

    res.status(200).send('Skill Test published successfully');
  }),

  deleteSkillTest: create(async (req, res) => {
    const { id } = req.params;

    await SkillTestQuestion.deleteMany({ testId: id });
    await SkillTest.deleteOne({ _id: id });

    res.status(200).send('Skill Test removed successfully');
  }),

  deleteSkillTestQuestion: create(async (req, res) => {
    const { questionId } = req.params;

    await SkillTestQuestion.findByIdAndRemove(questionId);

    res.status(200).send('Skill Test Question removed successfully');
  }),

  unpublishSkillTest: create(async (req, res) => {
    const { testId } = req.params;

    await SkillTest.findByIdAndUpdate(
      testId,
      {
        isPublished: false,
      },
      { new: true },
    );

    res.status(200).send('Skill Test unpublished successfully');
  }),
};
