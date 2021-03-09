import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';

import countriesRouter from './routes/countries';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/static', express.static(path.join(__dirname, 'public')));
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
