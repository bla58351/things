import { useState, useEffect, useCallback } from 'react';
import { Item, Location, Tag } from '../types';
import { itemsApi, locationsApi, tagsApi, categoriesApi, Category } from '../api';
import LocationTree from '../components/LocationTree';
import TagManager from '../components/TagManager';
import CategoryManager from '../components/CategoryManager';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import ItemForm from '../components/ItemForm';
import BatchActions from '../components/BatchActions';
import BatchMoveModal from '../components/BatchMoveModal';
import BatchTagsModal from '../components/BatchTagsModal';
import BatchCategoryModal from '../components/BatchCategoryModal';
import { AlertDialog, ConfirmDialog } from '../components/Dialog';
import layoutStyles from '../components/Layout.module.css';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // 批量选择相关状态
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBatchMoveModal, setShowBatchMoveModal] = useState(false);
  const [showBatchTagsModal, setShowBatchTagsModal] = useState(false);
  const [showBatchCategoryModal, setShowBatchCategoryModal] = useState(false);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  const fetchTags = useCallback(() => {
    tagsApi.list().then(setAllTags).catch(console.error);
  }, []);

  const fetchCategories = useCallback(() => {
    categoriesApi.list().then(setAllCategories).catch(console.error);
  }, []);

  const fetchData = useCallback(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (tag) params.tag = tag;
    if (selectedLocationId) params.locationId = selectedLocationId;

    itemsApi.list(params).then(setItems).catch(console.error);
  }, [search, category, tag, selectedLocationId]);

  const fetchLocations = useCallback(() => {
    locationsApi.list().then(setLocations).catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchLocations();
    fetchTags();
    fetchCategories();
  }, [fetchLocations, fetchTags, fetchCategories]);

  // 处理扫码跳转：读取 sessionStorage 中的位置ID
  useEffect(() => {
    const scanLocationId = sessionStorage.getItem('scanLocationId');
    if (scanLocationId) {
      setSelectedLocationId(scanLocationId);
      sessionStorage.removeItem('scanLocationId');
    }
  }, []);

  const handleAddItem = async (data: {
    name: string;
    category: string;
    tags: string[];
    locationId: string;
    quantity: number;
    description: string;
  }) => {
    try {
      await itemsApi.create(data);
      setShowAddModal(false);
      fetchData();
      fetchTags();
      fetchCategories();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const getSelectedLocationName = () => {
    const findLoc = (locs: Location[], id: string): string | null => {
      for (const loc of locs) {
        if (loc.id === id) return loc.name;
        if (loc.children) {
          const found = findLoc(loc.children, id);
          if (found) return `${loc.name} → ${found}`;
        }
      }
      return null;
    };
    return findLoc(locations, selectedLocationId!);
  };

  // 批量选择功能
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  // 批量移动
  const handleBatchMove = async (locationId: string) => {
    try {
      await itemsApi.batchUpdate(Array.from(selectedItems), { locationId });
      setShowBatchMoveModal(false);
      setSelectedItems(new Set());
      setSelectionMode(false);
      fetchData();
      setAlertMessage(`成功移动 ${selectedItems.size} 个物品`);
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  // 批量修改标签
  const handleBatchUpdateTags = async (tags: string[], mode: 'add' | 'replace' | 'remove') => {
    try {
      const selectedItemsList = items.filter(item => selectedItems.has(item.id));
      const updates = selectedItemsList.map(item => {
        let newTags = [...item.tags];
        if (mode === 'add') {
          newTags = [...new Set([...newTags, ...tags])];
        } else if (mode === 'replace') {
          newTags = tags;
        } else if (mode === 'remove') {
          newTags = newTags.filter(t => !tags.includes(t));
        }
        return itemsApi.update(item.id, { tags: newTags });
      });
      await Promise.all(updates);
      setShowBatchTagsModal(false);
      setSelectedItems(new Set());
      setSelectionMode(false);
      fetchData();
      fetchTags();
      setAlertMessage(`成功更新 ${selectedItems.size} 个物品的标签`);
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  // 批量修改分类
  const handleBatchUpdateCategory = async (categoryName: string) => {
    try {
      await itemsApi.batchUpdate(Array.from(selectedItems), { category: categoryName });
      setShowBatchCategoryModal(false);
      setSelectedItems(new Set());
      setSelectionMode(false);
      fetchData();
      fetchCategories();
      setAlertMessage(`成功更新 ${selectedItems.size} 个物品的分类`);
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      await itemsApi.batchDelete(Array.from(selectedItems));
      setConfirmBatchDelete(false);
      setSelectedItems(new Set());
      setSelectionMode(false);
      fetchData();
      setAlertMessage(`成功删除 ${selectedItems.size} 个物品`);
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <LocationTree
            locations={locations}
            selectedId={selectedLocationId}
            onSelect={setSelectedLocationId}
            title="位置管理"
            onRefresh={() => {
              fetchLocations();
              fetchData();
            }}
          />
        </div>
        <div className={styles.sidebarSection}>
          <TagManager
            tags={allTags}
            selectedTag={tag}
            onSelect={setTag}
            onRefresh={fetchTags}
          />
        </div>
        <div className={styles.sidebarSection}>
          <CategoryManager
            categories={allCategories}
            selectedCategory={category}
            onSelect={setCategory}
            onRefresh={fetchCategories}
          />
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.contentTitle}>
            <span className={styles.contentTitleText}>
              物品列表
              <span className={styles.contentTitleCount}>({items.length})</span>
            </span>
            {items.length > 0 && (
              <button
                onClick={toggleSelectionMode}
                style={{
                  padding: '6px 12px',
                  background: selectionMode ? '#ef4444' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {selectionMode ? '退出选择' : '批量管理'}
              </button>
            )}
          </div>
          {selectedLocationId && (
            <div className={styles.selectedLocation}>
              📍 当前筛选位置: {getSelectedLocationName()}
              <button
                className={styles.selectedLocationClear}
                onClick={() => setSelectedLocationId(null)}
              >
                ✕
              </button>
            </div>
          )}
          <SearchBar
            search={search}
            category={category}
            tag={tag}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onTagChange={setTag}
          />
        </div>

        {items.length === 0 ? (
          <div className="empty" style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p>暂无物品，点击右下角按钮添加</p>
          </div>
        ) : (
          <div className={styles.itemGrid}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                allTags={allTags}
                selectionMode={selectionMode}
                isSelected={selectedItems.has(item.id)}
                onToggleSelect={toggleItemSelection}
              />
            ))}
          </div>
        )}
      </section>

      {/* 批量操作工具栏 */}
      {selectionMode && (
        <BatchActions
          selectedItems={selectedItems}
          items={items}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onBatchMove={() => setShowBatchMoveModal(true)}
          onBatchUpdateTags={() => setShowBatchTagsModal(true)}
          onBatchUpdateCategory={() => setShowBatchCategoryModal(true)}
          onBatchDelete={() => setConfirmBatchDelete(true)}
        />
      )}

      {!selectionMode && (
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)} title="添加物品">
          +
        </button>
      )}

      {showAddModal && (
        <div className={layoutStyles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={layoutStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={layoutStyles.modalTitle}>添加物品</h3>
            <ItemForm onSubmit={handleAddItem} onCancel={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      {/* 批量移动模态框 */}
      {showBatchMoveModal && (
        <BatchMoveModal
          locations={locations}
          selectedCount={selectedItems.size}
          onConfirm={handleBatchMove}
          onCancel={() => setShowBatchMoveModal(false)}
        />
      )}

      {/* 批量修改标签模态框 */}
      {showBatchTagsModal && (
        <BatchTagsModal
          allTags={allTags}
          selectedCount={selectedItems.size}
          mode="add"
          onConfirm={handleBatchUpdateTags}
          onCancel={() => setShowBatchTagsModal(false)}
        />
      )}

      {/* 批量修改分类模态框 */}
      {showBatchCategoryModal && (
        <BatchCategoryModal
          allCategories={allCategories}
          selectedCount={selectedItems.size}
          onConfirm={handleBatchUpdateCategory}
          onCancel={() => setShowBatchCategoryModal(false)}
        />
      )}

      {alertMessage && (
        <AlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {confirmBatchDelete && (
        <ConfirmDialog
          message={`确定删除选中的 ${selectedItems.size} 个物品吗？此操作不可撤销。`}
          onConfirm={handleBatchDelete}
          onCancel={() => setConfirmBatchDelete(false)}
        />
      )}
    </div>
  );
}