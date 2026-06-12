import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        {!isHome && (
          <button className={styles.headerBack} onClick={() => navigate('/')}>
            ← 返回
          </button>
        )}
        <h1 className={styles.headerTitle}>📦 个人物品管理系统</h1>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}