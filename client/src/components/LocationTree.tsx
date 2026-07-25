import { useState } from 'react';
import { Location } from '../types';
import { locationsApi } from '../api';
import { AlertDialog, ConfirmDialog } from './Dialog';
import LocationQRCode from './LocationQRCode';
import BatchQRCodePrint from './BatchQRCodePrint';
import styles from './LocationTree.module.css';
import panelStyles from './SidebarPanel.module.css';

interface Props {
  locations: Location[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => void;
  title?: string;
}

function TreeNode({
  node,
  depth,
  selectedId,
  onSelect,
  onRefresh,
  editingId,
  nameInput,
  onStartAdd,
  onStartEdit,
  onNameInput,
  onCancelEdit,
  onConfirmAdd,
  onAlert,
  onConfirmDelete,
  onShowQRCode,
}: {
  node: Location;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => void;
  editingId: string | null;
  nameInput: string;
  onStartAdd: (parentId: string | null) => void;
  onStartEdit: (id: string, name: string) => void;
  onNameInput: (name: string) => void;
  onCancelEdit: () => void;
  onConfirmAdd: () => void;
  onAlert: (message: string) => void;
  onConfirmDelete: (id: string, name: string) => void;
  onShowQRCode: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  const handleRename = async () => {
    if (!nameInput.trim()) return;
    try {
      await locationsApi.update(editingId!, { name: nameInput.trim() });
      onCancelEdit();
      onRefresh();
    } catch (e) {
      onAlert((e as Error).message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    onConfirmDelete(id, name);
  };

  if (editingId === node.id) {
    return (
      <div className={styles.treeNode}>
        <div className={panelStyles.form} style={{ paddingLeft: depth * 4 }}>
          <input
            className={panelStyles.input}
            value={nameInput}
            onChange={(e) => onNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') onCancelEdit();
            }}
            autoFocus
          />
          <button className={panelStyles.confirmButton} onClick={handleRename}>
            ✓
          </button>
          <button className={panelStyles.cancelButton} onClick={onCancelEdit}>
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.treeNode}>
      <div
        className={`${panelStyles.item} ${selectedId === node.id ? panelStyles.itemActive : ''}`}
        style={{ paddingLeft: depth * 4 + 4 }}
        onClick={() => onSelect(selectedId === node.id ? null : node.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(selectedId === node.id ? null : node.id);
          }
        }}
      >
        {hasChildren ? (
          <button className={styles.nodeToggle} onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className={styles.nodeToggle} style={{ visibility: 'hidden' }} />
        )}
        <span className={styles.nodeName}>
          <span className={styles.nodeDot} style={{ background: node.color || '#6b7280' }} />
          {node.name}
        </span>
        <span className={panelStyles.itemActions}>
          <button
            className={panelStyles.actionButton}
            title="添加子位置"
            onClick={(e) => { e.stopPropagation(); onStartAdd(node.id); }}
          >
            +
          </button>
          <button
            className={panelStyles.actionButton}
            title="重命名"
            onClick={(e) => { e.stopPropagation(); onStartEdit(node.id, node.name); }}
          >
            ✎
          </button>
          <button
            className={panelStyles.actionButton}
            title="二维码"
            onClick={(e) => { e.stopPropagation(); onShowQRCode(node.id, node.name); }}
          >
            📱
          </button>
          <button
            className={panelStyles.actionButton}
            title="删除"
            onClick={(e) => { e.stopPropagation(); handleDelete(node.id, node.name); }}
          >
            ✕
          </button>
        </span>
      </div>

      {hasChildren && expanded && (
        <div className={styles.children}>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onRefresh={onRefresh}
              editingId={editingId}
              nameInput={nameInput}
              onStartAdd={onStartAdd}
              onStartEdit={onStartEdit}
              onNameInput={onNameInput}
              onCancelEdit={onCancelEdit}
              onConfirmAdd={onConfirmAdd}
              onAlert={onAlert}
              onConfirmDelete={onConfirmDelete}
              onShowQRCode={onShowQRCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddInlineForm({
  parentId,
  depth,
  nameInput,
  onNameInput,
  onConfirmAdd,
  onCancelEdit,
}: {
  parentId: string | null;
  depth: number;
  nameInput: string;
  onNameInput: (name: string) => void;
  onConfirmAdd: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div className={panelStyles.form} style={{ paddingLeft: depth * 14 }}>
      <input
        className={panelStyles.input}
        value={nameInput}
        onChange={(e) => onNameInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onConfirmAdd();
          if (e.key === 'Escape') onCancelEdit();
        }}
        placeholder={parentId ? '子位置名称' : '顶层位置名称'}
        autoFocus
      />
      <button className={panelStyles.confirmButton} onClick={onConfirmAdd}>
        ✓
      </button>
      <button className={panelStyles.cancelButton} onClick={onCancelEdit}>
        ✕
      </button>
    </div>
  );
}

function AddFormForLocation({
  locations,
  targetId,
  nameInput,
  onNameInput,
  onConfirmAdd,
  onCancelEdit,
}: {
  locations: Location[];
  targetId: string | null;
  nameInput: string;
  onNameInput: (name: string) => void;
  onConfirmAdd: () => void;
  onCancelEdit: () => void;
}) {
  if (targetId === null) {
    return (
      <AddInlineForm
        parentId={null}
        depth={0}
        nameInput={nameInput}
        onNameInput={onNameInput}
        onConfirmAdd={onConfirmAdd}
        onCancelEdit={onCancelEdit}
      />
    );
  }

  const findAndRender = (nodes: Location[], currentDepth: number): React.ReactNode => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return (
          <AddInlineForm
            parentId={targetId}
            depth={currentDepth + 1}
            nameInput={nameInput}
            onNameInput={onNameInput}
            onConfirmAdd={onConfirmAdd}
            onCancelEdit={onCancelEdit}
          />
        );
      }
      if (node.children && node.children.length > 0) {
        const result = findAndRender(node.children, currentDepth + 1);
        if (result) return result;
      }
    }
    return null;
  };

  return <>{findAndRender(locations, 0)}</>;
}

export default function LocationTree({ locations, selectedId, onSelect, onRefresh, title }: Props) {
  const [addingParentId, setAddingParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [isAddingTopLevel, setIsAddingTopLevel] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<{ id: string; name: string } | null>(null);
  const [qrCodeLocation, setQrCodeLocation] = useState<{ id: string; name: string } | null>(null);
  const [showBatchPrint, setShowBatchPrint] = useState(false);

  const handleAdd = async () => {
    const name = nameInput.trim();
    if (!name) {
      setAlertMessage('请输入位置名称');
      return;
    }
    try {
      await locationsApi.create({ name, parentId: addingParentId });
      setNameInput('');
      setAddingParentId(null);
      setIsAddingTopLevel(false);
      onRefresh();
    } catch (e) {
      setAlertMessage((e as Error).message);
    }
  };

  const handleStartAdd = (parentId: string | null) => {
    if (parentId === null) {
      setIsAddingTopLevel(true);
    } else {
      setAddingParentId(parentId);
      setIsAddingTopLevel(false);
    }
    setEditingId(null);
    setNameInput('');
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setAddingParentId(null);
    setIsAddingTopLevel(false);
    setNameInput(name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAddingParentId(null);
    setIsAddingTopLevel(false);
    setNameInput('');
  };

  const handleAlert = (message: string) => {
    setAlertMessage(message);
  };

  const handleConfirmDelete = (id: string, name: string) => {
    setConfirmMessage({ id, name });
  };

  const handleShowQRCode = (id: string, name: string) => {
    setQrCodeLocation({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmMessage) return;
    try {
      await locationsApi.delete(confirmMessage.id);
      if (selectedId === confirmMessage.id) onSelect(null);
      setConfirmMessage(null);
      onRefresh();
    } catch (e) {
      setAlertMessage((e as Error).message);
      setConfirmMessage(null);
    }
  };

  if (locations.length === 0 && !title) {
    return (
      <div className={panelStyles.panel}>
        <div className={styles.noData}>暂无位置</div>
        {isAddingTopLevel ? (
          <AddInlineForm
            parentId={null}
            depth={0}
            nameInput={nameInput}
            onNameInput={setNameInput}
            onConfirmAdd={handleAdd}
            onCancelEdit={handleCancelEdit}
          />
        ) : (
          <button className={styles.addRootBtn} onClick={() => handleStartAdd(null)}>
            + 添加位置
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={panelStyles.panel}>
      {title && (
        <div className={panelStyles.header}>
          <span className={panelStyles.title}>{title}</span>
          <div className={panelStyles.headerActions}>
          {locations.length > 0 && (
            <button
              className={panelStyles.iconButton}
              onClick={() => setShowBatchPrint(true)}
              title="批量打印二维码"
            >
              🖨️
            </button>
          )}
          {!isAddingTopLevel && (
            <button
              className={panelStyles.iconButton}
              onClick={() => handleStartAdd(null)}
              title={'\u6dfb\u52a0\u9876\u5c42\u4f4d\u7f6e'}
            >
              +
            </button>
          )}
          </div>
        </div>
      )}
      <div className={panelStyles.list}>
        <div
          className={`${panelStyles.item} ${selectedId === null ? panelStyles.itemActive : ''}`}
          onClick={() => onSelect(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(null);
            }
          }}
        >
          <span>{'\u5168\u90e8\u4f4d\u7f6e'}</span>
        </div>
      {locations.length === 0 && <div className={panelStyles.empty}>{'\u6682\u65e0\u4f4d\u7f6e'}</div>}
      {locations.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
          onRefresh={onRefresh}
          editingId={editingId}
          nameInput={nameInput}
          onStartAdd={handleStartAdd}
          onStartEdit={handleStartEdit}
          onNameInput={setNameInput}
          onCancelEdit={handleCancelEdit}
          onConfirmAdd={handleAdd}
          onAlert={handleAlert}
          onConfirmDelete={handleConfirmDelete}
          onShowQRCode={handleShowQRCode}
        />
      ))}
      {isAddingTopLevel && (
        <AddInlineForm
          parentId={null}
          depth={0}
          nameInput={nameInput}
          onNameInput={setNameInput}
          onConfirmAdd={handleAdd}
          onCancelEdit={handleCancelEdit}
        />
      )}
      {addingParentId !== null && !isAddingTopLevel && (
        <AddFormForLocation
          locations={locations}
          targetId={addingParentId}
          nameInput={nameInput}
          onNameInput={setNameInput}
          onConfirmAdd={handleAdd}
          onCancelEdit={handleCancelEdit}
        />
      )}
      {!title && !isAddingTopLevel && addingParentId === null && (
        <button className={styles.addRootBtn} onClick={() => handleStartAdd(null)}>
          + 添加顶层位置
        </button>
      )}
      </div>
      {alertMessage && (
        <AlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
      {confirmMessage && (
        <ConfirmDialog
          message={`确定删除位置「${confirmMessage.name}」吗？`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmMessage(null)}
        />
      )}
      {qrCodeLocation && (
        <LocationQRCode
          locationId={qrCodeLocation.id}
          locationName={qrCodeLocation.name}
          onClose={() => setQrCodeLocation(null)}
        />
      )}
      {showBatchPrint && (
        <BatchQRCodePrint
          locations={locations}
          onClose={() => setShowBatchPrint(false)}
        />
      )}
    </div>
  );
}