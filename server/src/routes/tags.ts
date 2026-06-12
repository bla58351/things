import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllTags, createTag, updateTag, deleteTag } from '../store';

const TAG_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const tags = getAllTags();
  res.json(tags);
});

router.post('/', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '标签名称不能为空' });
  }

  const tags = getAllTags();
  if (tags.some((t) => t.name === name)) {
    return res.status(400).json({ error: '标签已存在' });
  }

  const colorIndex = tags.length % TAG_COLORS.length;
  const tag = createTag({
    id: uuidv4(),
    name,
    color: TAG_COLORS[colorIndex],
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(tag);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '标签名称不能为空' });
  }
  const tags = getAllTags();
  if (tags.some((t) => t.name === name && t.id !== id)) {
    return res.status(400).json({ error: '标签名称已存在' });
  }
  const updated = updateTag(id, name);
  if (!updated) {
    return res.status(404).json({ error: '标签不存在' });
  }
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = deleteTag(id);
  if (!success) {
    return res.status(404).json({ error: '标签不存在' });
  }
  res.json({ message: '删除成功' });
});

export default router;