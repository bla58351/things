export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  color: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  tags: string[];
  locationId: string;
  quantity: number;
  description: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoveRecord {
  id: string;
  itemId: string;
  fromLocationId: string;
  toLocationId: string;
  note: string;
  movedAt: string;
}