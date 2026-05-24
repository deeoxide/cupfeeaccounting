import express, {} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Serve static files from the React app build
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cupfee Server is running' });
});
// Simple endpoint for accounts (initial migration check)
app.get('/api/accounts', (req, res) => {
    // In future phases, this will come from a database
    res.json({ message: 'Accounts API ready' });
});
// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map