import { useEffect, useRef } from 'react';
import layoutStyles from './Layout.module.css';
import styles from './Dialog.module.css';

interface AlertDialogProps {
  message: string;
  onClose: () => void;
}

export function AlertDialog({ message, onClose }: AlertDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={layoutStyles.modalOverlay} ref={overlayRef} onClick={onClose}>
      <div className={`${layoutStyles.modal} ${styles.dialog}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button className={`${layoutStyles.btn} ${layoutStyles.btnPrimary}`} onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className={layoutStyles.modalOverlay} onClick={onCancel}>
      <div className={`${layoutStyles.modal} ${styles.dialog}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button className={`${layoutStyles.btn} ${layoutStyles.btnSecondary}`} onClick={onCancel}>
            取消
          </button>
          <button className={`${layoutStyles.btn} ${layoutStyles.btnDanger}`} onClick={onConfirm}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}