import { useNavigate } from 'react-router-dom';
import { Item, Tag } from '../types';
import { getExpiryInfo } from '../utils/expiry';
import styles from './ItemCard.module.css';

interface Props {
  item: Item;
  allTags: Tag[];
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function ItemCard({ item, allTags, selectionMode, isSelected, onToggleSelect }: Props) {
  const navigate = useNavigate();
  const expiryInfo = getExpiryInfo(item.expirationDate, item.expiryReminderDays);
  const expiryClass = expiryInfo
    ? {
        safe: styles.expirySafe,
        warning: styles.expiryWarning,
        expired: styles.expiryExpired,
      }[expiryInfo.status]
    : '';

  const getTagColor = (name: string) => {
    return allTags.find((t) => t.name === name)?.color || '#6b7280';
  };

  const handleClick = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(item.id);
    } else {
      navigate(`/items/${item.id}`);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect(item.id);
    }
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
      onClick={handleClick}
    >
      {selectionMode && (
        <div className={styles.checkbox} onClick={handleCheckboxClick}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
        </div>
      )}
      <div className={styles.cardTitle}>{item.name}</div>
      <div className={styles.cardMeta}>
        {item.category && <span className={styles.cardCategory}>{item.category}</span>}
        {item.tags.map((tag) => (
          <span key={tag} className={styles.cardTag} style={{ background: getTagColor(tag) }}>
            {tag}
          </span>
        ))}
      </div>
      {item.locationPath && item.locationPath.length > 0 && (
        <div className={styles.cardLocation}>
          📍 {item.locationPath.join(' → ')}
        </div>
      )}
      {item.quantity > 1 && (
        <div className={styles.cardQuantity}>数量: {item.quantity}</div>
      )}
      {expiryInfo && (
        <div className={`${styles.cardExpiry} ${expiryClass}`}>
          <span className={styles.expiryDot} />
          <span>{expiryInfo.label}</span>
          <span className={styles.expiryDetail}>{expiryInfo.detail}</span>
        </div>
      )}
    </div>
  );
}
