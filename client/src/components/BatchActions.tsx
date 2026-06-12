import { Item } from '../types';

interface Props {
  selectedItems: Set<string>;
  items: Item[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchMove: () => void;
  onBatchUpdateTags: () => void;
  onBatchUpdateCategory: () => void;
  onBatchDelete: () => void;
}

export default function BatchActions({
  selectedItems,
  items,
  onSelectAll,
  onClearSelection,
  onBatchMove,
  onBatchUpdateTags,
  onBatchUpdateCategory,
  onBatchDelete,
}: Props) {
  const selectedCount = selectedItems.size;
  const allSelected = items.length > 0 && selectedCount === items.length;

  if (selectedCount === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #e5e7eb',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#374151',
        }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            style={{ cursor: 'pointer' }}
          />
          <span>已选择 <strong>{selectedCount}</strong> 项</span>
        </label>
        <button
          onClick={onClearSelection}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '13px',
            padding: '4px 8px',
          }}
        >
          取消选择
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={onBatchMove}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          📍 移动位置
        </button>
        <button
          onClick={onBatchUpdateTags}
          style={{
            padding: '8px 16px',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          🏷️ 修改标签
        </button>
        <button
          onClick={onBatchUpdateCategory}
          style={{
            padding: '8px 16px',
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          📂 修改分类
        </button>
        <button
          onClick={onBatchDelete}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          🗑️ 删除
        </button>
      </div>
    </div>
  );
}
