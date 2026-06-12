import { MoveRecord } from '../types';
import styles from './MoveHistory.module.css';

interface Props {
  records: MoveRecord[];
}

export default function MoveHistory({ records }: Props) {
  if (records.length === 0) {
    return <div className={styles.timelineEmpty}>暂无移动记录</div>;
  }

  return (
    <div className={styles.timeline}>
      {records.map((record) => (
        <div key={record.id} className={styles.timelineItem}>
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <div className={styles.timelineAction}>
              从{' '}
              <span className={styles.locationName}>{record.fromLocationName || '未知位置'}</span>
              {' '}→{' '}
              <span className={styles.locationName}>{record.toLocationName || '未知位置'}</span>
            </div>
            <div className={styles.timelineTime}>
              {new Date(record.movedAt).toLocaleString('zh-CN')}
            </div>
            {record.note && <div className={styles.timelineNote}>{record.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}