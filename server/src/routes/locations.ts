import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  buildLocationTree,
} from '../store';

const LOCATION_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const tree = buildLocationTree();
  res.json(tree);
});

router.post('/', (req: Request, res: Response) => {
  const { name, parentId, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: '位置名称不能为空' });
  }

  if (parentId) {
    const parent = getLocationById(parentId);
    if (!parent) {
      return res.status(400).json({ error: '父级位置不存在' });
    }
  }

  const locations = getAllLocations();
  const colorIndex = locations.length % LOCATION_COLORS.length;

  const location = createLocation({
    id: uuidv4(),
    name,
    parentId: parentId || null,
    description: description || '',
    color: LOCATION_COLORS[colorIndex],
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(location);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const location = getLocationById(id);
  if (!location) {
    return res.status(404).json({ error: '位置不存在' });
  }

  const updates: Record<string, string> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;

  const updated = updateLocation(id, updates);
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const location = getLocationById(id);
  if (!location) {
    return res.status(404).json({ error: '位置不存在' });
  }

  const success = deleteLocation(id);
  if (!success) {
    return res.status(400).json({ error: '该位置下存在子位置，无法删除' });
  }

  res.json({ message: '删除成功' });
});

export default router;