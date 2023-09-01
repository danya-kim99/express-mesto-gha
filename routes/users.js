const router = require('express').Router();
const {
  getUsers, getUser, getMe, patchUser, patchAvatar,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getMe);

router.get('/:userId', getUser);

router.patch('/me', patchUser);

router.patch('/me/avatar', patchAvatar);

module.exports = router;
