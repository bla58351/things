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
  locationPath?: string[];
}

export interface Location {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  color: string;
  createdAt: string;
  children?: Location[];
}

export interface MoveRecord {
  id: string;
  itemId: string;
  fromLocationId: string;
  toLocationId: string;
  movedAt: string;
  note: string;
  fromLocationName?: string;
  toLocationName?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}