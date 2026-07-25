import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi, Category, itemsApi, locationsApi, tagsApi } from '../api';
import { Item, Location, Tag } from '../types';
import styles from './OverviewPage.module.css';

interface DistributionItem {
  label: string;
  count: number;
}

function flattenLocations(locations: Location[]): Location[] {
  return locations.flatMap((location) => [
    location,
    ...(location.children ? flattenLocations(location.children) : []),
  ]);
}

function getTopDistribution(entries: DistributionItem[], limit = 6): DistributionItem[] {
  const sorted = [...entries].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  if (sorted.length <= limit) return sorted;

  const visible = sorted.slice(0, limit - 1);
  const otherCount = sorted.slice(limit - 1).reduce((sum, item) => sum + item.count, 0);
  return [...visible, { label: '\u5176\u4ed6', count: otherCount }];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [itemList, locationList, categoryList, tagList] = await Promise.all([
        itemsApi.list(),
        locationsApi.list(),
        categoriesApi.list(),
        tagsApi.list(),
      ]);
      setItems(itemList);
      setLocations(locationList);
      setCategories(categoryList);
      setTags(tagList);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const flatLocations = useMemo(() => flattenLocations(locations), [locations]);
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const categoryDistribution = useMemo(() => {
    const counts = new Map(categories.map((category) => [category.name, 0]));
    items.forEach((item) => {
      const name = item.category || '\u672a\u5206\u7c7b';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return getTopDistribution(
      Array.from(counts, ([label, count]) => ({ label, count })).filter((item) => item.count > 0),
    );
  }, [categories, items]);

  const locationDistribution = useMemo(() => {
    const locationNames = new Map(flatLocations.map((location) => [location.id, location.name]));
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const name = locationNames.get(item.locationId) || '\u672a\u77e5\u4f4d\u7f6e';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return getTopDistribution(Array.from(counts, ([label, count]) => ({ label, count })));
  }, [flatLocations, items]);

  const recentItems = useMemo(
    () => [...items]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    [items],
  );

  const maxCategoryCount = Math.max(...categoryDistribution.map((item) => item.count), 1);
  const maxLocationCount = Math.max(...locationDistribution.map((item) => item.count), 1);

  if (loading) {
    return (
      <div className={styles.stateCard} role="status">
        <span className={styles.spinner} />
        <p>{'\u6b63\u5728\u6574\u7406\u7269\u54c1\u603b\u89c8\u2026'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.stateIcon}>!</span>
        <h2>{'\u603b\u89c8\u52a0\u8f7d\u5931\u8d25'}</h2>
        <p>{error}</p>
        <button className={styles.primaryButton} onClick={fetchOverview}>{'\u91cd\u65b0\u52a0\u8f7d'}</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{'\u7a7a\u95f4\u4e0e\u7269\u54c1\u4e00\u76ee\u4e86\u7136'}</p>
          <h2 className={styles.heroTitle}>{'\u7269\u54c1\u603b\u89c8'}</h2>
          <p className={styles.heroDescription}>
            {`\u5f53\u524d\u5171\u7ba1\u7406 ${items.length} \u79cd\u7269\u54c1\uff0c\u5206\u5e03\u5728 ${flatLocations.length} \u4e2a\u4f4d\u7f6e\u3002`}
          </p>
        </div>
        <button className={styles.heroButton} onClick={() => navigate('/')}>
          {'\u67e5\u770b\u5168\u90e8\u7269\u54c1'}
          <span aria-hidden="true">{'\u2192'}</span>
        </button>
      </section>

      <section className={styles.statsGrid} aria-label={'\u6838\u5fc3\u7edf\u8ba1'}>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.blue}`}>{'\u54c1'}</span>
          <div>
            <p className={styles.statLabel}>{'\u7269\u54c1\u79cd\u7c7b'}</p>
            <strong className={styles.statValue}>{items.length}</strong>
            <span className={styles.statUnit}>{'\u79cd'}</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.green}`}>{'\u91cf'}</span>
          <div>
            <p className={styles.statLabel}>{'\u7269\u54c1\u603b\u91cf'}</p>
            <strong className={styles.statValue}>{totalQuantity}</strong>
            <span className={styles.statUnit}>{'\u4ef6'}</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.amber}`}>{'\u7c7b'}</span>
          <div>
            <p className={styles.statLabel}>{'\u5206\u7c7b'}</p>
            <strong className={styles.statValue}>{categories.length}</strong>
            <span className={styles.statUnit}>{'\u4e2a'}</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.purple}`}>{'\u4f4d'}</span>
          <div>
            <p className={styles.statLabel}>{'\u5b58\u653e\u4f4d\u7f6e'}</p>
            <strong className={styles.statValue}>{flatLocations.length}</strong>
            <span className={styles.statUnit}>{'\u5904'}</span>
          </div>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>{'\u5206\u7c7b\u5206\u5e03'}</h3>
              <p>{'\u6309\u7269\u54c1\u79cd\u7c7b\u7edf\u8ba1'}</p>
            </div>
            <span className={styles.panelBadge}>{categories.length} {'\u4e2a\u5206\u7c7b'}</span>
          </div>
          {categoryDistribution.length > 0 ? (
            <div className={styles.distributionList}>
              {categoryDistribution.map((item) => (
                <div className={styles.distributionItem} key={item.label}>
                  <div className={styles.distributionMeta}>
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className={styles.barTrack}>
                    <span
                      className={`${styles.barFill} ${styles.categoryBar}`}
                      style={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>{'\u6dfb\u52a0\u7269\u54c1\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a\u5206\u7c7b\u5206\u5e03\u3002'}</p>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>{'\u4f4d\u7f6e\u5206\u5e03'}</h3>
              <p>{'\u7269\u54c1\u4e3b\u8981\u5b58\u653e\u5728\u54ea\u91cc'}</p>
            </div>
            <span className={styles.panelBadge}>{flatLocations.length} {'\u4e2a\u4f4d\u7f6e'}</span>
          </div>
          {locationDistribution.length > 0 ? (
            <div className={styles.distributionList}>
              {locationDistribution.map((item) => (
                <div className={styles.distributionItem} key={item.label}>
                  <div className={styles.distributionMeta}>
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className={styles.barTrack}>
                    <span
                      className={`${styles.barFill} ${styles.locationBar}`}
                      style={{ width: `${(item.count / maxLocationCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>{'\u6dfb\u52a0\u7269\u54c1\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a\u4f4d\u7f6e\u5206\u5e03\u3002'}</p>
          )}
        </section>

        <section className={`${styles.panel} ${styles.recentPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>{'\u6700\u8fd1\u66f4\u65b0'}</h3>
              <p>{'\u6700\u8fd1\u53d1\u751f\u53d8\u5316\u7684\u7269\u54c1'}</p>
            </div>
            <span className={styles.panelBadge}>{tags.length} {'\u4e2a\u6807\u7b7e'}</span>
          </div>
          {recentItems.length > 0 ? (
            <div className={styles.recentList}>
              {recentItems.map((item) => (
                <button
                  className={styles.recentItem}
                  key={item.id}
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  <span className={styles.recentAvatar}>
                    {item.name.trim().charAt(0).toUpperCase() || '\u7269'}
                  </span>
                  <span className={styles.recentContent}>
                    <strong>{item.name}</strong>
                    <span>{item.category || '\u672a\u5206\u7c7b'} &middot; {item.locationPath?.join(' / ') || '\u672a\u77e5\u4f4d\u7f6e'}</span>
                  </span>
                  <time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time>
                  <span className={styles.recentArrow} aria-hidden="true">{'\u203a'}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyRecent}>
              <p>{'\u8fd8\u6ca1\u6709\u7269\u54c1\u8bb0\u5f55'}</p>
              <button className={styles.primaryButton} onClick={() => navigate('/')}>{'\u53bb\u6dfb\u52a0\u7269\u54c1'}</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
