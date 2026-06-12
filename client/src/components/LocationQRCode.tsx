import { QRCodeSVG } from 'qrcode.react';
import { AlertDialog } from './Dialog';
import layoutStyles from './Layout.module.css';
import styles from './LocationQRCode.module.css';

interface Props {
  locationId: string;
  locationName: string;
  onClose: () => void;
}

export default function LocationQRCode({ locationId, locationName, onClose }: Props) {
  const qrContent = `${window.location.origin}/location/${locationId}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrElement = document.getElementById('qr-svg');
    if (!qrElement) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>位置二维码 - ${locationName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            .location-name {
              margin-top: 16px;
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              text-align: center;
            }
            .location-id {
              margin-top: 8px;
              font-size: 12px;
              color: #6b7280;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${new XMLSerializer().serializeToString(qrElement as Element)}
            <div class="location-name">${locationName}</div>
            <div class="location-id">ID: ${locationId}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className={layoutStyles.modalOverlay} onClick={onClose}>
      <div className={layoutStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={layoutStyles.modalTitle}>位置二维码</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.qrWrapper}>
            <QRCodeSVG
              id="qr-svg"
              value={qrContent}
              size={180}
              level="M"
              includeMargin={false}
            />
          </div>
          <div className={styles.info}>
            <div className={styles.locationName}>{locationName}</div>
            <div className={styles.locationId}>ID: {locationId}</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary} onClick={onClose}>
            关闭
          </button>
          <button className={layoutStyles.btn + ' ' + layoutStyles.btnPrimary} onClick={handlePrint}>
            🖨️ 打印二维码
          </button>
        </div>
      </div>
    </div>
  );
}