const router = require('express').Router();
const regex = require('../utils/regex');
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUser, getMe, patchUser, patchAvatar,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getMe);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().required().length(24),
  }),
}), getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), patchUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(RegExp(regex)),
  }),
}), patchAvatar);

module.exports = router;
