const router = require('express').Router();
const {
  getUsers, getUser, getMe, patchUser, patchAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/me', getMe);

router.get('/users/:userId', getUser);

router.patch('/users/me', patchUser);

router.patch('/users/me/avatar', patchAvatar);

module.exports = router;
