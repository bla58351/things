import { useEffect, useState } from 'react';
import { Tag } from '../types';
import { tagsApi } from '../api';
import { AlertDialog, ConfirmDialog } from './Dialog';
import styles from './TagManager.module.css';
import panelStyles from './SidebarPanel.module.css';

interface Props {
  tags: Tag[];
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
  onRefresh: () => void;
}

export default function TagManager({ tags, selectedTag, onSelect, onRefresh }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Tag | null>(null);

  useEffect(() => {
    if (isAdding) {
      setEditingTag(null);
      setEditName('');
    }
  }, [isAdding]);

  const handleAdd = async () => {
    const name = newTagName.trim();
    if (!name) {
      setAlertMessage('请输入标签名称');
      return;
    }
    try {
      await tagsApi.create(name);
      setNewTagName('');
      setIsAdding(false);
      onRefresh();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const handleUpdate = async () => {
    const name = editName.trim();
    if (!name || !editingTag) {
      setAlertMessage('请输入标签名称');
      return;
    }
    try {
      await tagsApi.update(editingTag.id, name);
      if (selectedTag === editingTag.name) onSelect(name);
      setEditingTag(null);
      onRefresh();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await tagsApi.delete(confirmDelete.id);
      if (selectedTag === confirmDelete.name) onSelect(null);
      setConfirmDelete(null);
      onRefresh();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.header}>
        <span className={styles.title}>标签管理</span>
        {!isAdding && (
          <button className={styles.addBtn} onClick={() => setIsAdding(true)} title="添加标签">
            +
          </button>
        )}
      </div>

      {isAdding && (
        <div className={panelStyles.form}>
          <input
            className={panelStyles.input}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setIsAdding(false); setNewTagName(''); }
            }}
            placeholder="标签名称"
            autoFocus
          />
          <button className={styles.confirmBtn} onClick={handleAdd}>✓</button>
          <button className={styles.cancelBtn} onClick={() => { setIsAdding(false); setNewTagName(''); }}>✕</button>
        </div>
      )}

      <div className={panelStyles.list}>
        <div
          className={`${panelStyles.item} ${selectedTag === null ? panelStyles.itemActive : ''}`}
          onClick={() => onSelect(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(null);
            }
          }}
        >
          <span>全部</span>
        </div>
        {tags.map((tag) => (
          <div
            key={tag.id}
            className={`${panelStyles.item} ${selectedTag === tag.name ? panelStyles.itemActive : ''}`}
            onClick={() => onSelect(selectedTag === tag.name ? null : tag.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(selectedTag === tag.name ? null : tag.name);
              }
            }}
          >
            {editingTag?.id === tag.id ? (
              <div className={panelStyles.form} onClick={(e) => e.stopPropagation()}>
                <input
                  className={panelStyles.input}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate();
                    if (e.key === 'Escape') setEditingTag(null);
                  }}
                  autoFocus
                />
                <button className={styles.confirmBtn} onClick={handleUpdate}>✓</button>
                <button className={styles.cancelBtn} onClick={() => setEditingTag(null)}>✕</button>
              </div>
            ) : (
              <>
                <span className={styles.tagDot} style={{ background: tag.color }} />
                <span className={styles.tagName}>{tag.name}</span>
                <div className={panelStyles.itemActions}>
                  <button
                    className={panelStyles.actionButton}
                    onClick={(e) => { e.stopPropagation(); setEditingTag(tag); setEditName(tag.name); setIsAdding(false); setNewTagName(''); }}
                    title="编辑"
                  >
                    ✎
                  </button>
                  <button
                    className={panelStyles.actionButton}
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(tag); }}
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {tags.length === 0 && !isAdding && (
          <div className={styles.empty}>暂无标签</div>
        )}
      </div>

      {alertMessage && (
        <AlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={`确定删除标签「${confirmDelete.name}」吗？`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}