import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  createMoveRecord,
  getMoveRecordsByItemId,
  getLocationPath,
  getAllLocations,
} from '../store';

type PinyinFn = (text: string, options?: { toneType?: string; separator?: string }) => string;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pinyinModule: { pinyin: PinyinFn } = require('pinyin-pro');
const pinyin: PinyinFn = pinyinModule.pinyin;

function toPinyin(text: string): string {
  return pinyin(text, { toneType: 'none', separator: '' }).toLowerCase();
}

const router = Router();

router.get('/', (req: Request, res: Response) => {
  let items = getAllItems();
  const { search, category, tag, locationId } = req.query;

  if (search && typeof search === 'string') {
    const keywords = search.trim().toLowerCase().split(/\s+/);
    items = items
      .map((item) => {
        const name = item.name.toLowerCase();
        const namePinyin = toPinyin(item.name);
        const category = item.category.toLowerCase();
        const categoryPinyin = toPinyin(item.category);
        const description = item.description.toLowerCase();
        const tags = item.tags.map((t) => t.toLowerCase());
        const tagPinyins = item.tags.map((t) => toPinyin(t));

        let score = 0;
        for (const kw of keywords) {
          if (kw.startsWith('name:')) {
            const val = kw.slice(5);
            if (name.includes(val) || namePinyin.includes(val)) score += 10;
          } else if (kw.startsWith('cat:') || kw.startsWith('category:')) {
            const val = kw.startsWith('cat:') ? kw.slice(4) : kw.slice(9);
            if (category.includes(val) || categoryPinyin.includes(val)) score += 8;
          } else if (kw.startsWith('tag:')) {
            const val = kw.slice(4);
            if (tags.some((t, i) => t.includes(val) || tagPinyins[i].includes(val))) score += 6;
          } else if (kw.startsWith('desc:')) {
            const val = kw.slice(5);
            if (description.includes(val)) score += 4;
          } else {
            if (name.includes(kw) || namePinyin.includes(kw)) score += 10;
            if (category.includes(kw) || categoryPinyin.includes(kw)) score += 8;
            if (tags.some((t, i) => t.includes(kw) || tagPinyins[i].includes(kw))) score += 6;
            if (description.includes(kw)) score += 4;
          }
        }

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }

  if (category && typeof category === 'string') {
    items = items.filter((item) => item.category === category);
  }

  if (tag && typeof tag === 'string') {
    items = items.filter((item) => item.tags.includes(tag));
  }

  if (locationId && typeof locationId === 'string') {
    items = items.filter((item) => item.locationId === locationId);
  }

  const itemsWithPath = items.map((item) => ({
    ...item,
    locationPath: getLocationPath(item.locationId),
  }));

  res.json(itemsWithPath);
});

router.get('/categories', (_req: Request, res: Response) => {
  const items = getAllItems();
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  res.json(categories);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = getItemById(id);
  if (!item) {
    return res.status(404).json({ error: '物品不存在' });
  }

  res.json({
    ...item,
    locationPath: getLocationPath(item.locationId),
  });
});

router.post('/', (req: Request, res: Response) => {
  const { name, category, tags, locationId, quantity, description, photoUrl } = req.body;

  if (!name) {
    return res.status(400).json({ error: '物品名称不能为空' });
  }
  if (!locationId) {
    return res.status(400).json({ error: '请选择物品所在位置' });
  }

  const now = new Date().toISOString();
  const item = createItem({
    id: uuidv4(),
    name,
    category: category || '',
    tags: tags || [],
    locationId,
    quantity: quantity || 1,
    description: description || '',
    photoUrl: photoUrl || undefined,
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json({
    ...item,
    locationPath: getLocationPath(item.locationId),
  });
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = getItemById(id);
  if (!item) {
    return res.status(404).json({ error: '物品不存在' });
  }

  const { name, category, tags, locationId, quantity, description, photoUrl } = req.body;
  const updates: Record<string, unknown> = {};

  if (name !== undefined) updates.name = name;
  if (category !== undefined) updates.category = category;
  if (tags !== undefined) updates.tags = tags;
  if (quantity !== undefined) updates.quantity = quantity;
  if (description !== undefined) updates.description = description;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;

  if (locationId !== undefined && locationId !== item.locationId) {
    createMoveRecord({
      id: uuidv4(),
      itemId: id,
      fromLocationId: item.locationId,
      toLocationId: locationId,
      movedAt: new Date().toISOString(),
      note: '',
    });
    updates.locationId = locationId;
  }

  const updated = updateItem(id, updates);
  if (!updated) {
    return res.status(500).json({ error: '更新失败' });
  }

  res.json({
    ...updated,
    locationPath: getLocationPath(updated.locationId),
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = getItemById(id);
  if (!item) {
    return res.status(404).json({ error: '物品不存在' });
  }

  deleteItem(id);
  res.json({ message: '删除成功' });
});

router.post('/:id/move', (req: Request, res: Response) => {
  const { id } = req.params;
  const { toLocationId, note } = req.body;

  const item = getItemById(id);
  if (!item) {
    return res.status(404).json({ error: '物品不存在' });
  }

  if (!toLocationId) {
    return res.status(400).json({ error: '目标位置不能为空' });
  }

  const record = createMoveRecord({
    id: uuidv4(),
    itemId: id,
    fromLocationId: item.locationId,
    toLocationId,
    movedAt: new Date().toISOString(),
    note: note || '',
  });

  updateItem(id, { locationId: toLocationId });

  const updated = getItemById(id)!;

  res.json({
    item: {
      ...updated,
      locationPath: getLocationPath(updated.locationId),
    },
    record,
  });
});

router.get('/:id/history', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = getItemById(id);
  if (!item) {
    return res.status(404).json({ error: '物品不存在' });
  }

  const records = getMoveRecordsByItemId(id);
  const locations = getAllLocations();
  const locationMap = new Map(locations.map((l) => [l.id, l.name]));

  const recordsWithNames = records.map((r) => ({
    ...r,
    fromLocationName: locationMap.get(r.fromLocationId) || '未知位置',
    toLocationName: locationMap.get(r.toLocationId) || '未知位置',
  }));

  res.json(recordsWithNames);
});

// 批量更新
router.put('/batch', (req: Request, res: Response) => {
  const { ids, data } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要更新的物品' });
  }

  let updated = 0;
  for (const id of ids) {
    const item = getItemById(id);
    if (item) {
      const updates: Record<string, unknown> = {};

      if (data.locationId !== undefined) {
        updates.locationId = data.locationId;
        createMoveRecord({
          id: uuidv4(),
          itemId: id,
          fromLocationId: item.locationId,
          toLocationId: data.locationId,
          movedAt: new Date().toISOString(),
          note: '批量移动',
        });
      }

      if (data.category !== undefined) updates.category = data.category;
      if (data.tags !== undefined) updates.tags = data.tags;

      updates.updatedAt = new Date().toISOString();

      if (updateItem(id, updates)) {
        updated++;
      }
    }
  }

  res.json({ updated });
});

// 批量删除
router.delete('/batch', (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的物品' });
  }

  let deleted = 0;
  for (const id of ids) {
    if (getItemById(id)) {
      deleteItem(id);
      deleted++;
    }
  }

  res.json({ deleted });
});

export default router;