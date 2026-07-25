import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMainPage = location.pathname === '/' || location.pathname === '/overview';

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        {!isMainPage && (
          <button className={styles.headerBack} onClick={() => navigate('/')}>
            ← 返回
          </button>
        )}
        <h1 className={styles.headerTitle}>📦 个人物品管理系统</h1>
        {isMainPage && (
          <nav className={styles.headerNav} aria-label={'\u4e3b\u5bfc\u822a'}>
            <NavLink
              to="/overview"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              {'\u603b\u89c8'}
            </NavLink>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              {'\u7269\u54c1'}
            </NavLink>
          </nav>
        )}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}