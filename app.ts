import * as express from 'express';
import * as cors from 'cors';

import authRouter from './routes/authentication';
import countriesRouter from './routes/countries';

const app = express();

app.use(cors());

// CORS middleware
const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
}
app.use(allowCrossDomain);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/todos', countriesRouter);

// catch 404 and forward to error handler
app.use(function(_req_, res, _next_) {
  res.status(404).json({
    statusCode: 404
  });
});

// error handler
app.use(function(err, _req_, res, _next_) {
  res.json({
    statusCode: 500,
    message: err.message,
    stack: err.stack
  });
});

export {
  app
};
