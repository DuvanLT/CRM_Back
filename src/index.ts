import 'dotenv/config';
import { App } from './app/app.js';

const app = new App();
const PORT = Number(process.env.PORT) || 3000;

app.start(PORT);
