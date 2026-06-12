import fs from 'fs';
import path from 'path';
import { Item, Location, Tag, MoveRecord, Category } from './types';

const DATA_DIR = path.resolve(__dirname, '../../data');

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