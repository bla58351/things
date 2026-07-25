import { useEffect, useState } from 'react';
import { AlertDialog, ConfirmDialog } from './Dialog';
import { categoriesApi, Category } from '../api';
import styles from './CategoryManager.module.css';
import panelStyles from './SidebarPanel.module.css';

interface Props {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
  onRefresh: () => void;
}

export default function CategoryManager({ categories, selectedCategory, onSelect, onRefresh }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  useEffect(() => {
    if (isAdding) {
      setEditingCategory(null);
      setEditName('');
    }
  }, [isAdding]);

  const handleAdd = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setAlertMessage('请输入分类名称');
      return;
    }
    if (categories.some((cat) => cat.name === name)) {
      setAlertMessage('分类已存在');
      return;
    }
    try {
      await categoriesApi.create(name);
      setNewCategoryName('');
      setIsAdding(false);
      onRefresh();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const handleUpdate = async () => {
    const name = editName.trim();
    if (!name || !editingCategory) {
      setAlertMessage('请输入分类名称');
      return;
    }
    if (categories.some((cat) => cat.name === name && cat.id !== editingCategory.id)) {
      setAlertMessage('分类名称已存在');
      return;
    }
    try {
      await categoriesApi.update(editingCategory.id, name);
      if (selectedCategory === editingCategory.name) {
        onSelect(name);
      }
      setEditingCategory(null);
      onRefresh();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await categoriesApi.delete(confirmDelete.id);
      if (selectedCategory === confirmDelete.name) {
        onSelect(null);
      }
      setConfirmDelete(null);
      onRefresh();
    } catch (e) {
      setAlertMessage((e as Error).message);
      setConfirmDelete(null);
    }
  };

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.header}>
        <span className={styles.title}>分类管理</span>
        {!isAdding && (
          <button className={styles.addBtn} onClick={() => setIsAdding(true)} title="添加分类">
            +
          </button>
        )}
      </div>

      {isAdding && (
        <div className={panelStyles.form}>
          <input
            className={panelStyles.input}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setIsAdding(false); setNewCategoryName(''); }
            }}
            placeholder="分类名称"
            autoFocus
          />
          <button className={styles.confirmBtn} onClick={handleAdd}>✓</button>
          <button className={styles.cancelBtn} onClick={() => { setIsAdding(false); setNewCategoryName(''); }}>✕</button>
        </div>
      )}

      <div className={panelStyles.list}>
        <div
          className={`${panelStyles.item} ${selectedCategory === null ? panelStyles.itemActive : ''}`}
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
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`${panelStyles.item} ${selectedCategory === cat.name ? panelStyles.itemActive : ''}`}
            onClick={() => onSelect(selectedCategory === cat.name ? null : cat.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(selectedCategory === cat.name ? null : cat.name);
              }
            }}
          >
            {editingCategory?.id === cat.id ? (
              <div className={panelStyles.form} onClick={(e) => e.stopPropagation()}>
                <input
                  className={panelStyles.input}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate();
                    if (e.key === 'Escape') setEditingCategory(null);
                  }}
                  autoFocus
                />
                <button className={styles.confirmBtn} onClick={handleUpdate}>✓</button>
                <button className={styles.cancelBtn} onClick={() => setEditingCategory(null)}>✕</button>
              </div>
            ) : (
              <>
                <span className={styles.categoryName}>{cat.name}</span>
                <div className={panelStyles.itemActions}>
                  <button
                    className={panelStyles.actionButton}
                    onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setEditName(cat.name); setIsAdding(false); setNewCategoryName(''); }}
                    title="编辑"
                  >
                    ✎
                  </button>
                  <button
                    className={panelStyles.actionButton}
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(cat); }}
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && !isAdding && (
          <div className={styles.empty}>暂无分类</div>
        )}
      </div>

      {alertMessage && (
        <AlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={`确定删除分类「${confirmDelete.name}」吗？`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}