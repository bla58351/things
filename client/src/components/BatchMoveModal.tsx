import { useState } from 'react';
import { Location } from '../types';
import layoutStyles from './Layout.module.css';
import styles from './BatchMoveModal.module.css';

interface Props {
  locations: Location[];
  selectedCount: number;
  onConfirm: (locationId: string) => void;
  onCancel: () => void;
}

function flattenLocations(locations: Location[], depth: number = 0): { location: Location; depth: number }[] {
  const result: { location: Location; depth: number }[] = [];
  for (const loc of locations) {
    result.push({ location: loc, depth });
    if (loc.children && loc.children.length > 0) {
      result.push(...flattenLocations(loc.children, depth + 1));
    }
  }
  return result;
}

export default function BatchMoveModal({ locations, selectedCount, onConfirm, onCancel }: Props) {
  const [targetLocationId, setTargetLocationId] = useState('');
  const flatLocations = flattenLocations(locations);

  return (
    <div className={layoutStyles.modalOverlay} onClick={onCancel}>
      <div className={layoutStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={layoutStyles.modalTitle}>批量移动物品</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
          将 <strong>{selectedCount}</strong> 个物品移动到：
        </p>
        <div className={styles.locationPicker}>
          {flatLocations.length === 0 ? (
            <div style={{ padding: 16, color: '#9ca3af', textAlign: 'center' }}>
              暂无位置，请先添加位置
            </div>
          ) : (
            flatLocations.map(({ location, depth }) => (
              <div
                key={location.id}
                className={`${styles.locationOption} ${targetLocationId === location.id ? styles.locationOptionActive : ''}`}
                style={{ paddingLeft: 12 + depth * 24 }}
                onClick={() => setTargetLocationId(location.id)}
              >
                📍 {location.name}
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className={layoutStyles.btn + ' ' + layoutStyles.btnPrimary}
            disabled={!targetLocationId}
            onClick={() => onConfirm(targetLocationId)}
            style={{ opacity: targetLocationId ? 1 : 0.5 }}
          >
            确认移动
          </button>
        </div>
      </div>
    </div>
  );
}
