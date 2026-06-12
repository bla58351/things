import express from 'express';
import cors from 'cors';
import path from 'path';
import itemsRouter from './routes/items';
import locationsRouter from './routes/locations';
import tagsRouter from './routes/tags';
import categoriesRouter from './routes/categories';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/items', itemsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/categories', categoriesRouter);

// 静态文件服务（用于生产环境）
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// SPA 回退路由
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});