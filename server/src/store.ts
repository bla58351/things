import fs from 'fs';
import path from 'path';
import { Item, Location, Tag, MoveRecord, Category } from './types';

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');

function readJSON<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 初始化数据目录和默认数据
export function initializeStore(): void {
  // 确保数据目录存在
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('Created data directory:', DATA_DIR);
  }

  const now = new Date().toISOString();

  // 初始化 categories.json
  const categoriesPath = path.join(DATA_DIR, 'categories.json');
  if (!fs.existsSync(categoriesPath)) {
    const defaultCategories: Category[] = [
      { id: 'cat-1', name: '电子产品', createdAt: now },
      { id: 'cat-2', name: '书籍', createdAt: now },
      { id: 'cat-3', name: '工具', createdAt: now },
      { id: 'cat-4', name: '衣物', createdAt: now },
      { id: 'cat-5', name: '食品', createdAt: now },
    ];
    writeJSON('categories.json', defaultCategories);
    console.log('Initialized categories with default data');
  }

  // 初始化 locations.json
  const locationsPath = path.join(DATA_DIR, 'locations.json');
  if (!fs.existsSync(locationsPath)) {
    const defaultLocations: Location[] = [
      { id: 'loc-1', name: '客厅', parentId: null, description: '客厅区域', color: '#3b82f6', createdAt: now },
      { id: 'loc-2', name: '卧室', parentId: null, description: '卧室区域', color: '#8b5cf6', createdAt: now },
      { id: 'loc-3', name: '书房', parentId: null, description: '书房区域', color: '#10b981', createdAt: now },
      { id: 'loc-4', name: '储藏室', parentId: null, description: '储藏室', color: '#f59e0b', createdAt: now },
    ];
    writeJSON('locations.json', defaultLocations);
    console.log('Initialized locations with default data');
  }

  // 初始化 tags.json
  const tagsPath = path.join(DATA_DIR, 'tags.json');
  if (!fs.existsSync(tagsPath)) {
    const defaultTags: Tag[] = [
      { id: 'tag-1', name: '常用', color: '#ef4444', createdAt: now },
      { id: 'tag-2', name: '重要', color: '#f59e0b', createdAt: now },
      { id: 'tag-3', name: '收藏', color: '#eab308', createdAt: now },
    ];
    writeJSON('tags.json', defaultTags);
    console.log('Initialized tags with default data');
  }

  // 初始化 items.json
  const itemsPath = path.join(DATA_DIR, 'items.json');
  if (!fs.existsSync(itemsPath)) {
    writeJSON('items.json', []);
    console.log('Initialized items.json (empty)');
  }

  // 初始化 moveRecords.json
  const recordsPath = path.join(DATA_DIR, 'moveRecords.json');
  if (!fs.existsSync(recordsPath)) {
    writeJSON('moveRecords.json', []);
    console.log('Initialized moveRecords.json (empty)');
  }
}

export function getAllItems(): Item[] {
  return readJSON<Item>('items.json');
}

export function getItemById(id: string): Item | undefined {
  const items = getAllItems();
  return items.find((item) => item.id === id);
}

export function createItem(item: Item): Item {
  const items = getAllItems();
  items.push(item);
  writeJSON('items.json', items);
  return item;
}

export function updateItem(id: string, updates: Partial<Item>): Item | null {
  const items = getAllItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  writeJSON('items.json', items);
  return items[index];
}

export function deleteItem(id: string): boolean {
  const items = getAllItems();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  writeJSON('items.json', filtered);

  const records = getAllMoveRecords();
  writeJSON(
    'moveRecords.json',
    records.filter((r) => r.itemId !== id),
  );
  return true;
}

export function getAllLocations(): Location[] {
  return readJSON<Location>('locations.json');
}

export function getLocationById(id: string): Location | undefined {
  const locations = getAllLocations();
  return locations.find((loc) => loc.id === id);
}

export function createLocation(loc: Location): Location {
  const locations = getAllLocations();
  locations.push(loc);
  writeJSON('locations.json', locations);
  return loc;
}

export function updateLocation(id: string, updates: Partial<Location>): Location | null {
  const locations = getAllLocations();
  const index = locations.findIndex((loc) => loc.id === id);
  if (index === -1) return null;
  locations[index] = { ...locations[index], ...updates };
  writeJSON('locations.json', locations);
  return locations[index];
}

export function deleteLocation(id: string): boolean {
  const locations = getAllLocations();
  const hasChildren = locations.some((loc) => loc.parentId === id);
  if (hasChildren) return false;

  const items = getAllItems();
  const itemsInLocation = items.filter((item) => item.locationId === id);
  
  itemsInLocation.forEach((item) => {
    deleteItem(item.id);
  });

  const filtered = locations.filter((loc) => loc.id !== id);
  if (filtered.length === locations.length) return false;
  writeJSON('locations.json', filtered);
  return true;
}

export function getAllTags(): Tag[] {
  return readJSON<Tag>('tags.json');
}

export function createTag(tag: Tag): Tag {
  const tags = getAllTags();
  tags.push(tag);
  writeJSON('tags.json', tags);
  return tag;
}

export function updateTag(id: string, name: string): Tag | null {
  const tags = getAllTags();
  const index = tags.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tags[index] = { ...tags[index], name };
  writeJSON('tags.json', tags);
  return tags[index];
}

export function deleteTag(id: string): boolean {
  const tags = getAllTags();
  const filtered = tags.filter((t) => t.id !== id);
  if (filtered.length === tags.length) return false;
  writeJSON('tags.json', filtered);
  return true;
}

export function getAllMoveRecords(): MoveRecord[] {
  return readJSON<MoveRecord>('moveRecords.json');
}

export function getMoveRecordsByItemId(itemId: string): MoveRecord[] {
  const records = getAllMoveRecords();
  return records
    .filter((r) => r.itemId === itemId)
    .sort((a, b) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime());
}

export function createMoveRecord(record: MoveRecord): MoveRecord {
  const records = getAllMoveRecords();
  records.push(record);
  writeJSON('moveRecords.json', records);
  return record;
}

export function getLocationPath(locationId: string): string[] {
  const locations = getAllLocations();
  const path: string[] = [];
  let currentId: string | null = locationId;

  while (currentId) {
    const loc = locations.find((l) => l.id === currentId);
    if (!loc) break;
    path.unshift(loc.name);
    currentId = loc.parentId;
  }

  return path;
}

export function buildLocationTree(): Location[] {
  const locations = getAllLocations();
  const map = new Map<string, Location & { children: Location[] }>();

  locations.forEach((loc) => {
    map.set(loc.id, { ...loc, children: [] });
  });

  const roots: (Location & { children: Location[] })[] = [];

  map.forEach((loc) => {
    if (loc.parentId && map.has(loc.parentId)) {
      map.get(loc.parentId)!.children.push(loc);
    } else {
      roots.push(loc);
    }
  });

  return roots;
}

export function getAllCategories(): Category[] {
  return readJSON<Category>('categories.json');
}

export function getCategoryById(id: string): Category | undefined {
  const categories = getAllCategories();
  return categories.find((cat) => cat.id === id);
}

export function getCategoryByName(name: string): Category | undefined {
  const categories = getAllCategories();
  return categories.find((cat) => cat.name === name);
}

export function createCategory(category: Category): Category {
  const categories = getAllCategories();
  categories.push(category);
  writeJSON('categories.json', categories);
  return category;
}

export function updateCategory(id: string, name: string): Category | null {
  const categories = getAllCategories();
  const index = categories.findIndex((cat) => cat.id === id);
  if (index === -1) return null;
  categories[index] = { ...categories[index], name };
  writeJSON('categories.json', categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getAllCategories();
  const filtered = categories.filter((cat) => cat.id !== id);
  if (filtered.length === categories.length) return false;
  writeJSON('categories.json', filtered);
  return true;
}