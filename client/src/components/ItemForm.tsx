import { useState, useEffect } from 'react';
import { Item, Location } from '../types';
import { locationsApi, categoriesApi, Category } from '../api';
import TagInput from './TagInput';
import { AlertDialog } from './Dialog';
import layoutStyles from './Layout.module.css';
import styles from './ItemForm.module.css';

interface Props {
  item?: Item;
  onSubmit: (data: {
    name: string;
    category: string;
    tags: string[];
    locationId: string;
    quantity: number;
    description: string;
  }) => void;
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

export default function ItemForm({ item, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [locationId, setLocationId] = useState(item?.locationId || '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [description, setDescription] = useState(item?.description || '');
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    locationsApi.list().then(setLocations).catch(() => {});
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  const flatLocations = flattenLocations(locations);
  const selectedLocation = flatLocations.find((l) => l.location.id === locationId);

  const getLocationLabel = () => {
    if (!selectedLocation) return '点击选择位置...';
    const path: string[] = [selectedLocation.location.name];
    let current = selectedLocation.location;
    const findParent = (locs: Location[], targetId: string): string[] | null => {
      for (const loc of locs) {
        if (loc.id === targetId) return [loc.name];
        if (loc.children) {
          const result = findParent(loc.children, targetId);
          if (result) return [loc.name, ...result];
        }
      }
      return null;
    };
    const locationPath = findParent(locations, locationId);
    return locationPath ? locationPath.join(' → ') : selectedLocation.location.name;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!locationId) {
      setAlertMessage('请选择位置');
      return;
    }
    onSubmit({
      name: name.trim(),
      category: category.trim(),
      tags,
      locationId,
      quantity,
      description: description.trim(),
    });
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>物品名称 *</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：MacBook Pro"
            autoFocus
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>分类</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">请选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>数量</label>
            <input
              className={styles.input}
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>标签</label>
          <TagInput selectedTags={tags} onChange={setTags} onAlert={setAlertMessage} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>位置 *</label>
          <button
            type="button"
            className={styles.locationPicker}
            onClick={() => setShowLocationPicker(true)}
          >
            {locationId ? `📍 ${getLocationLabel()}` : '📌 点击选择位置...'}
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>备注</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="物品描述、特征等..."
          />
        </div>

        <div className={styles.formActions}>
          <button type="button" className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary} onClick={onCancel}>
            取消
          </button>
          <button type="submit" className={layoutStyles.btn + ' ' + layoutStyles.btnPrimary}>
            {item ? '保存修改' : '添加物品'}
          </button>
        </div>
      </form>

      {showLocationPicker && (
        <div className={layoutStyles.modalOverlay} onClick={() => setShowLocationPicker(false)}>
          <div className={layoutStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={layoutStyles.modalTitle}>选择位置</h3>
            <div className={styles.locationPickerModal}>
              {flatLocations.length === 0 ? (
                <div style={{ padding: 16, color: '#9ca3af', textAlign: 'center' }}>
                  暂无位置，请先在左侧位置树中添加
                </div>
              ) : (
                flatLocations.map(({ location, depth }) => (
                  <div
                    key={location.id}
                    className={`${styles.locationOption} ${depth > 0 ? styles.locationOptionChildren : ''} ${locationId === location.id ? styles.locationOptionActive : ''}`}
                    style={{ paddingLeft: 12 + depth * 24 }}
                    onClick={() => {
                      setLocationId(location.id);
                      setShowLocationPicker(false);
                    }}
                  >
                    📍 {location.name}
                  </div>
                ))
              )}
            </div>
            <div className={styles.formActions} style={{ marginTop: 16 }}>
              <button
                type="button"
                className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary}
                onClick={() => setShowLocationPicker(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      {alertMessage && (
        <AlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
    </>
  );
}