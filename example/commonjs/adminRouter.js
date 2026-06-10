const express = require('express');

/**

* Nested router example
  */
const adminRouter = express.Router();
exports.adminRouter = adminRouter;
adminRouter.get('/dashboard', (_req, res) => {
  res.status(200).json({
    section: 'dashboard',
  });
});
adminRouter.get('/users/:id', (req, res) => {
  res.status(200).json({
    adminUserId: req.params.id,
  });
});

adminRouter.post('/users', (req, res) => {
  res.status(201).json({
    message: 'User created',
    body: req.body,
  });
});

const updateUser = (req, res) => {
  res.status(200).json({
    message: 'User updated',
    id: req.params.id,
    body: req.body,
  });
};
adminRouter.put('/users/:id', updateUser);

adminRouter.delete('/users/:id', (req, res) => {
  res.status(200).json({
    message: 'User deleted',
    id: req.params.id,
  });
});
adminRouter.get('/search', (req, res) => {
  res.json({ query: req.query });
});

adminRouter.get('/teams/:teamId/users/:userId', (req, res) => {
  const { teamId, userId } = req.params;
  if (!userId) {
    return res.status(404).json({ message: 'User not found', code: 404 });
  }
  if (!teamId) {
    return res.status(404).json({ message: 'Team not found', code: 404 });
  }
  res.status(200).json({ teamId, userId, message: 'success', status: 200 });
});
module.exports = {
  adminRouter,
};
