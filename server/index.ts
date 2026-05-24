import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Serve static files from the React app build
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Cupfee Server is running' });
});

// Simple endpoint for accounts (initial migration check)
app.get('/api/accounts', (req: Request, res: Response) => {
  // In future phases, this will come from a database
  res.json({ message: 'Accounts API ready' });
});

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*any', (req: Request, res: Response) => {
  res.sendFile('index.html', { root: clientDistPath });
});

app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 SME Cloud Accounting Server is running!`);
  console.log(`   - Local:  http://localhost:${PORT}`);
  console.log(`   - Global: http://[Your-Server-IP]:${PORT}`);
  console.log(`   - Mode:   HTTP (No SSL)`);
});
