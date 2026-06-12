import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { locationsApi } from '../api';
import styles from './LocationScanPage.module.css';

export default function LocationScanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/', { replace: true });
      return;
    }

    // 验证位置是否存在，然后跳转到首页并选中该位置
    locationsApi.list().then((locations) => {
      const exists = locations.some((loc) => loc.id === id);
      if (exists) {
        // 使用 sessionStorage 传递选中的位置ID
        sessionStorage.setItem('scanLocationId', id);
        navigate('/', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }).catch(() => {
      navigate('/', { replace: true });
    });
  }, [id, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.text}>正在定位...</p>
    </div>
  );
}
