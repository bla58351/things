import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllCategories,
  getCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllItems,
} from '../store';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const categories = getAllCategories();
  res.json(categories.sort((a, b) => a.name.localeCompare(b.name)));
});

router.post('/', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: '分类名称不能为空' });
  }

  const existing = getCategoryByName(name.trim());
  if (existing) {
    return res.status(400).json({ error: '分类已存在' });
  }

  const category = createCategory({
    id: uuidv4(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(category);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: '分类名称不能为空' });
  }

  const existing = getCategoryByName(name.trim());
  if (existing && existing.id !== id) {
    return res.status(400).json({ error: '分类名称已存在' });
  }

  const updated = updateCategory(id, name.trim());
  if (!updated) {
    return res.status(404).json({ error: '分类不存在' });
  }

  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const items = getAllItems();
  const categoryItems = items.filter((item) => item.category === id);

  if (categoryItems.length > 0) {
    return res.status(400).json({ error: '该分类下存在物品，无法删除' });
  }

  const success = deleteCategory(id);
  if (!success) {
    return res.status(404).json({ error: '分类不存在' });
  }

  res.json({ message: '删除成功' });
});

export default router;