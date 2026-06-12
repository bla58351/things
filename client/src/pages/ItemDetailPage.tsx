import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item, Location, MoveRecord, Tag } from '../types';
import { itemsApi, locationsApi, tagsApi } from '../api';
import ItemForm from '../components/ItemForm';
import MoveHistory from '../components/MoveHistory';
import { AlertDialog, ConfirmDialog } from '../components/Dialog';
import layoutStyles from '../components/Layout.module.css';
import styles from './ItemDetailPage.module.css';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [records, setRecords] = useState<MoveRecord[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [editing, setEditing] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState('');
  const [moveNote, setMoveNote] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchItem = useCallback(() => {
    if (!id) return;
    itemsApi.getById(id).then(setItem).catch(() => navigate('/'));
  }, [id, navigate]);

  const fetchLocations = useCallback(() => {
    locationsApi.list().then(setLocations).catch(console.error);
  }, []);

  const fetchRecords = useCallback(() => {
    if (!id) return;
    itemsApi.history(id).then(setRecords).catch(console.error);
  }, [id]);

  const fetchTags = useCallback(() => {
    tagsApi.list().then(setAllTags).catch(console.error);
  }, []);

  useEffect(() => {
    fetchItem();
    fetchLocations();
    fetchRecords();
    fetchTags();
  }, [fetchItem, fetchLocations, fetchRecords, fetchTags]);

  const handleUpdate = async (data: {
    name: string;
    category: string;
    tags: string[];
    locationId: string;
    quantity: number;
    description: string;
  }) => {
    if (!id) return;
    try {
      await itemsApi.update(id, data);
      setEditing(false);
      fetchItem();
      fetchRecords();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await itemsApi.delete(id);
      navigate('/');
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const handleMove = async () => {
    if (!id || !moveTargetId) return;
    try {
      await itemsApi.move(id, moveTargetId, moveNote);
      setShowMoveModal(false);
      setMoveTargetId('');
      setMoveNote('');
      fetchItem();
      fetchRecords();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const getTagColor = (name: string) => {
    return allTags.find((t) => t.name === name)?.color || '#6b7280';
  };

  const flattenLocations = (locs: Location[], depth: number = 0): { location: Location; depth: number }[] => {
    const result: { location: Location; depth: number }[] = [];
    for (const loc of locs) {
      result.push({ location: loc, depth });
      if (loc.children && loc.children.length > 0) {
        result.push(...flattenLocations(loc.children, depth + 1));
      }
    }
    return result;
  };

  if (!item) return null;

  return (
    <div className={styles.page}>
      {editing ? (
        <div className={styles.card}>
          <div className={styles.cardTitle}>编辑物品</div>
          <ItemForm item={item} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div>
              <h2 className={styles.itemName}>{item.name}</h2>
              {item.locationPath && item.locationPath.length > 0 && (
                <div className={styles.itemLocation}>
                  📍 {item.locationPath.join(' → ')}
                </div>
              )}
            </div>
            <div className={styles.actions}>
              <button
                className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary}
                onClick={() => setEditing(true)}
              >
                编辑
              </button>
              <button
                className={layoutStyles.btn + ' ' + layoutStyles.btnDanger}
                onClick={() => setConfirmDelete(true)}
              >
                删除
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>基本信息</div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>名称</span>
                <span className={styles.infoValue}>{item.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>分类</span>
                <span className={styles.infoValue}>{item.category || '未分类'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>数量</span>
                <span className={styles.infoValue}>{item.quantity}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>创建时间</span>
                <span className={styles.infoValue}>{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>标签</span>
                <div className={styles.tags}>
                  {item.tags.length === 0 ? (
                    <span style={{ color: '#9ca3af', fontSize: 14 }}>无标签</span>
                  ) : (
                    item.tags.map((tag) => (
                      <span key={tag} className={styles.tag} style={{ background: getTagColor(tag) }}>
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>更新时间</span>
                <span className={styles.infoValue}>{new Date(item.updatedAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>
            {item.description && (
              <div className={styles.description}>{item.description}</div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>位置变更</div>
            <div className={styles.moveSection}>
              <span className={styles.moveLocation}>
                当前位置: {item.locationPath ? item.locationPath.join(' → ') : '未知'}
              </span>
              <button className={styles.moveBtn} onClick={() => setShowMoveModal(true)}>
                移动物品
              </button>
            </div>
          </div>

          <div className={styles.historyCard}>
            <div className={styles.cardTitle}>移动记录</div>
            <MoveHistory records={records} />
          </div>
        </>
      )}

      {showMoveModal && (
        <div className={layoutStyles.modalOverlay} onClick={() => setShowMoveModal(false)}>
          <div className={layoutStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={layoutStyles.modalTitle}>移动物品</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
              将「{item.name}」从「{item.locationPath?.join(' → ') || '未知'}」移动到：
            </p>
            <div className={styles.moveLocationPicker}>
              {flattenLocations(locations).map(({ location, depth }) => (
                <div
                  key={location.id}
                  className={`${styles.locationOption} ${location.id === item.locationId ? styles.locationOptionDisabled : ''}`}
                  style={{
                    paddingLeft: 12 + depth * 24,
                    background: moveTargetId === location.id ? '#eff6ff' : undefined,
                    color: moveTargetId === location.id ? '#2563eb' : undefined,
                  }}
                  onClick={() => {
                    if (location.id !== item.locationId) {
                      setMoveTargetId(location.id);
                    }
                  }}
                >
                  📍 {location.name}
                  {location.id === item.locationId && ' (当前位置)'}
                </div>
              ))}
            </div>
            <textarea
              className={styles.moveNote}
              placeholder="移动备注（可选）"
              value={moveNote}
              onChange={(e) => setMoveNote(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary}
                onClick={() => setShowMoveModal(false)}
              >
                取消
              </button>
              <button
                className={layoutStyles.btn + ' ' + layoutStyles.btnPrimary}
                disabled={!moveTargetId}
                onClick={handleMove}
                style={{ opacity: moveTargetId ? 1 : 0.5 }}
              >
                确认移动
              </button>
            </div>
          </div>
        </div>
      )}
      {alertMessage && (
        <AlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message="确定删除这个物品吗？此操作不可撤销。"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}