import { useState } from 'react';
import { Tag } from '../types';
import TagInput from './TagInput';
import layoutStyles from './Layout.module.css';

interface Props {
  allTags: Tag[];
  selectedCount: number;
  mode: 'add' | 'replace' | 'remove';
  onConfirm: (tags: string[], mode: 'add' | 'replace' | 'remove') => void;
  onCancel: () => void;
}

export default function BatchTagsModal({ allTags, selectedCount, mode: initialMode, onConfirm, onCancel }: Props) {
  const [tags, setTags] = useState<string[]>([]);
  const [mode, setMode] = useState<'add' | 'replace' | 'remove'>(initialMode);

  return (
    <div className={layoutStyles.modalOverlay} onClick={onCancel}>
      <div className={layoutStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={layoutStyles.modalTitle}>批量修改标签</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
          为 <strong>{selectedCount}</strong> 个物品批量修改标签
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>
            操作模式
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setMode('add')}
              style={{
                flex: 1,
                padding: '8px',
                background: mode === 'add' ? '#3b82f6' : '#f3f4f6',
                color: mode === 'add' ? '#fff' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              追加标签
            </button>
            <button
              onClick={() => setMode('replace')}
              style={{
                flex: 1,
                padding: '8px',
                background: mode === 'replace' ? '#3b82f6' : '#f3f4f6',
                color: mode === 'replace' ? '#fff' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              替换标签
            </button>
            <button
              onClick={() => setMode('remove')}
              style={{
                flex: 1,
                padding: '8px',
                background: mode === 'remove' ? '#3b82f6' : '#f3f4f6',
                color: mode === 'remove' ? '#fff' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              移除标签
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            {mode === 'add' && '将标签添加到现有标签列表'}
            {mode === 'replace' && '用新标签替换所有现有标签'}
            {mode === 'remove' && '从现有标签列表中移除指定标签'}
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>
            选择标签
          </label>
          <TagInput selectedTags={tags} onChange={setTags} onAlert={() => {}} />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className={layoutStyles.btn + ' ' + layoutStyles.btnPrimary}
            disabled={tags.length === 0}
            onClick={() => onConfirm(tags, mode)}
            style={{ opacity: tags.length > 0 ? 1 : 0.5 }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
