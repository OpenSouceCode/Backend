const create = require('../create');
const SkillTest = require('../../models/SkillTest');
const SkillTestQuestion = require('../../models/SkillTestQuestion');
const validators = require('../../validators/skillTest');
const { ROLES, STATUS } = require('../../config');

const assignProperties = (from, to) =>
  Object.keys(from).forEach((key) => to.setAttribute(key, from[key]));

module.exports = {
  getSkillTests: create(async (req, res) => {
    const { page = 1, per_page: perPage = 10, isPublished } = req.query;

    const filterObj = {
      isPublished: isPublished === 'true' && req.user.role === ROLES.ADMIN,
    };

    const skillTests = await SkillTest.find(filterObj)
      .limit(perPage * 1)
      .skip((page - 1) * perPage);

    const count = await SkillTest.countDocuments();

    res.json({
      data: {
        totalPages: Math.ceil(count / perPage),
        currentPage: page,
        skillTests,
      },
    });
  }),

  getSkillTestQuestions: create(async (req, res) => {
    const { testId } = req.params;
    const { page = 1, per_page: perPage = 10 } = req.query;

    const skillTest = await SkillTest.findById(testId);

    if (!skillTest.isPublished && req.user.role !== ROLES.ADMIN) {
      return res
        .status(STATUS.FORBIDDEN)
        .send('The user is forbidden to access the skill test');
    }

    const skillTestQuestions = await SkillTestQuestion.find({ testId })
      .limit(perPage * 1)
      .skip((page - 1) * perPage);

    const count = await SkillTestQuestion.find({ testId }).countDocuments();

    return res.json({
      data: {
        totalPages: Math.ceil(count / perPage),
        currentPage: page,
        skillTestQuestions,
      },
    });
  }),

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

      const skillTest = await SkillTest.findById(id);

      Object.keys(res.locals.inputBody).forEach((key) => {
        skillTest[key] = res.locals.inputBody[key];
      });

      await skillTest.save();

      res.json({ data: skillTest });
    },
    {
      validation: {
        validators: validators.updateSkillTest,
        throwError: true,
      },
      inputs: ['name', 'image', 'description'],
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
        return res.status(STATUS.BAD_REQUEST).send('Bad request');
      }

      assignProperties(res.locals.inputBody, skillTestQuestion);

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

  deleteSkillTest: create(async (req, res) => {
    const { id } = req.params;

    await SkillTestQuestion.deleteMany({ testId: id });
    await SkillTest.deleteOne({ _id: id });

    res.status(STATUS.OK).send('Skill Test removed successfully');
  }),

  deleteSkillTestQuestion: create(async (req, res) => {
    const { questionId } = req.params;

    await SkillTestQuestion.findByIdAndRemove(questionId);

    res.status(STATUS.OK).send('Skill Test Question removed successfully');
  }),

  publishSkillTest: create(async (req, res) => {
    const { testId } = req.params;

    await SkillTest.findByIdAndUpdate(
      testId,
      {
        isPublished: true,
      },
      { new: true },
    );

    res.status(STATUS.OK).send('Skill Test published successfully');
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

    res.status(STATUS.OK).send('Skill Test unpublished successfully');
  }),
};
