import express from 'express';
//todo: caseSensitive not working as expected in my swagger lib
const demoRouter = express.Router({ caseSensitive: true });
demoRouter.use(
  '/guided-demo',
  (req, _res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
  },
  (req, _res, next) => {
    console.log('Request Type:', req.method);
    next();
  },
);

demoRouter.get('/guided-id-demo/:id', (req, res, next) => {
  if (req.params.id === '0') {
    const msg = 'Special handler for user ID 0';
    console.log(msg);

    return next('route');
  }
  res.send(`User ${req.params.id}`);
});

demoRouter.get('/guided-id-demo/:id', (req, res) => {
  res.status(200).json({ msg: 'Special handler for user ID 0', id: req.params.id });
});

demoRouter.get('/guided-no-param', (req, res) => {
  res.status(200).json({ msg: 'Special handler for user ID 0', query: req.query });
});
demoRouter.get('/Hello', (req, res) => {
  res.send('Hello route');
});

export default demoRouter;
