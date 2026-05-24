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
console.log(`[Server] Static files path: ${clientDistPath}`);
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
// Using regex for maximum compatibility in Express 5
app.get(/^(?!\/api).+/, (req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 SME Cloud Accounting Server is running!`);
  console.log(`   - Port:   ${PORT}`);
  console.log(`   - Host:   ${HOST}`);
  console.log(`   - Mode:   HTTP (No SSL)`);
});
