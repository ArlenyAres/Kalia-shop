import { getEnv } from './config/env.js';
import { createApp } from './app.js';

const env = getEnv();

createApp(env).listen(env.PORT, () => {
  console.log(`Kalia server listening on http://localhost:${env.PORT}`);
});
