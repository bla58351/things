import { useState } from 'react';
import { Category } from '../api';
import layoutStyles from './Layout.module.css';

interface Props {
  allCategories: Category[];
  selectedCount: number;
  onConfirm: (categoryName: string) => void;
  onCancel: () => void;
}

export default function BatchCategoryModal({ allCategories, selectedCount, onConfirm, onCancel }: Props) {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const handleConfirm = () => {
    const finalCategory = category === '__custom__' ? customCategory : category;
    if (finalCategory.trim()) {
      onConfirm(finalCategory.trim());
    }
  };

  return (
    <div className={layoutStyles.modalOverlay} onClick={onCancel}>
      <div className={layoutStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={layoutStyles.modalTitle}>批量修改分类</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
          为 <strong>{selectedCount}</strong> 个物品设置分类
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>
            选择分类
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
            }}
          >
            <option value="">请选择分类</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
            <option value="__custom__">+ 自定义分类</option>
          </select>
        </div>

        {category === '__custom__' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>
              自定义分类名称
            </label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="输入新分类名称"
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className={layoutStyles.btn + ' ' + layoutStyles.btnPrimary}
            disabled={!category || (category === '__custom__' && !customCategory.trim())}
            onClick={handleConfirm}
            style={{ opacity: (category && (category !== '__custom__' || customCategory.trim())) ? 1 : 0.5 }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
