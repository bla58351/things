import { useEffect, useState } from 'react';
import { Tag } from '../types';
import { tagsApi } from '../api';
import styles from './SearchBar.module.css';

interface Props {
  search: string;
  category: string | null;
  categories: string[];
  tag: string | null;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string | null) => void;
  onTagChange: (tag: string | null) => void;
}

export default function SearchBar({
  search,
  category,
  categories,
  tag,
  onSearchChange,
  onCategoryChange,
  onTagChange,
}: Props) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    tagsApi.list().then(setTags).catch(() => {});
  }, []);

  const hasFilters = search || category || tag;

  return (
    <div className={styles.searchBar}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="搜索物品名称、分类、标签..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        className={styles.filterSelect}
        value={category ?? ''}
        onChange={(e) => onCategoryChange(e.target.value || null)}
      >
        <option value="">全部分类</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        className={styles.filterSelect}
        value={tag ?? ''}
        onChange={(e) => onTagChange(e.target.value || null)}
      >
        <option value="">全部标签</option>
        {tags.map((t) => (
          <option key={t.id} value={t.name}>{t.name}</option>
        ))}
      </select>
      {hasFilters && (
        <button
          className={styles.clearBtn}
          onClick={() => {
            onSearchChange('');
            onCategoryChange(null);
            onTagChange(null);
          }}
        >
          清除筛选
        </button>
      )}
    </div>
  );
}