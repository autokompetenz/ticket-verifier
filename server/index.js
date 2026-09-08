import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 4000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`API TicketCheck démarrée sur http://localhost:${PORT}`);
  if (!process.env.DATABASE_URL) {
    console.warn('⚠ ATTENTION : DATABASE_URL n\'est pas définie. Copie .env.example vers .env.');
  }
});