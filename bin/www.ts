import { app } from '../app';
import * as config from 'config';
import * as mongoose from 'mongoose';

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

const PORT = normalizePort(process.env.PORT || '3000');

/**
 * Actions to perform to start the server.
 */
async function start() {
  try {
    await mongoose.connect(config.get('mongoURI'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

    if (process.env.USE_PROXY) {
      const globalAgent = require('global-agent');

      process.env.GLOBAL_AGENT_HTTP_PROXY = process.env.USE_PROXY;
      process.env.GLOBAL_AGENT_HTTPS_PROXY = process.env.USE_PROXY;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      globalAgent.bootstrap();
    }

  } catch (e) {
    console.log('Server Error', e.message);
    process.exit(1);
  }
}

// Starting the server.
start();
