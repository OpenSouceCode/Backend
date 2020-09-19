const create = require('../create');
const SkillTest = require('../../models/SkillTest');
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
};
