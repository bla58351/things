export type ExpiryStatus = 'safe' | 'warning' | 'expired';

export interface ExpiryInfo {
  status: ExpiryStatus;
  daysRemaining: number;
  label: string;
  detail: string;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseLocalDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatOptionalDate(value?: string): string {
  if (!value) return '未设置';
  const date = parseLocalDate(value);
  return date ? date.toLocaleDateString('zh-CN') : value;
}

export function getExpiryInfo(
  expirationDate?: string,
  reminderDays = 7,
  now = new Date(),
): ExpiryInfo | null {
  if (!expirationDate) return null;
  const expiry = parseLocalDate(expirationDate);
  if (!expiry) return null;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / DAY_IN_MS);

  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return {
      status: 'expired',
      daysRemaining,
      label: '已过期',
      detail: `已过期 ${overdueDays} 天`,
    };
  }

  if (daysRemaining === 0) {
    return {
      status: 'warning',
      daysRemaining,
      label: '今天到期',
      detail: '请尽快处理',
    };
  }

  if (daysRemaining <= reminderDays) {
    return {
      status: 'warning',
      daysRemaining,
      label: '即将到期',
      detail: `剩余 ${daysRemaining} 天`,
    };
  }

  return {
    status: 'safe',
    daysRemaining,
    label: '保质期正常',
    detail: `还有 ${daysRemaining} 天`,
  };
}
