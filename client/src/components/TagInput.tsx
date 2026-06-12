import { useState, useEffect, useRef } from 'react';
import { Tag } from '../types';
import { tagsApi } from '../api';
import styles from './TagInput.module.css';

interface Props {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  onAlert?: (message: string) => void;
}

export default function TagInput({ selectedTags, onChange, onAlert }: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tagsApi.list().then(setAllTags).catch(console.error);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onChange([...selectedTags, tagName]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const removeTag = (tagName: string) => {
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  const handleCreateTag = async () => {
    const name = inputValue.trim();
    if (!name) return;
    try {
      const newTag = await tagsApi.create(name);
      setAllTags([...allTags, newTag]);
      addTag(name);
    } catch (e) {
      if (onAlert) {
        onAlert((e as Error).message);
      } else {
        alert((e as Error).message);
      }
    }
  };

  const filteredTags = allTags.filter(
    (t) => !selectedTags.includes(t.name) && t.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const getTagColor = (name: string) => {
    return allTags.find((t) => t.name === name)?.color || '#6b7280';
  };

  return (
    <div className={styles.tagWrapper} ref={wrapperRef}>
      <div className={styles.tagInput} onClick={() => setShowDropdown(true)}>
        {selectedTags.map((tag) => (
          <span key={tag} className={styles.tag} style={{ background: getTagColor(tag) }}>
            {tag}
            <button className={styles.tagRemove} onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>
              ×
            </button>
          </span>
        ))}
        <input
          className={styles.tagInputField}
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (inputValue.trim()) handleCreateTag();
            }
            if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
              removeTag(selectedTags[selectedTags.length - 1]);
            }
          }}
          placeholder={selectedTags.length === 0 ? '选择或输入标签...' : ''}
        />
      </div>
      {showDropdown && (inputValue || filteredTags.length > 0) && (
        <div className={styles.tagDropdown}>
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className={styles.tagDropdownItem}
              onClick={() => addTag(tag.name)}
            >
              <span className={styles.tagDot} style={{ background: tag.color }} />
              {tag.name}
            </div>
          ))}
          {inputValue.trim() && !allTags.some((t) => t.name === inputValue.trim()) && (
            <div className={styles.tagDropdownCreate} onClick={handleCreateTag}>
              + 创建标签「{inputValue.trim()}」
            </div>
          )}
        </div>
      )}
    </div>
  );
}