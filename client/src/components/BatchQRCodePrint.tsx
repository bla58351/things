import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Location } from '../types';
import layoutStyles from './Layout.module.css';
import styles from './BatchQRCodePrint.module.css';

interface Props {
  locations: Location[];
  onClose: () => void;
}

function flattenLocations(locations: Location[]): Location[] {
  const result: Location[] = [];
  for (const loc of locations) {
    result.push(loc);
    if (loc.children && loc.children.length > 0) {
      result.push(...flattenLocations(loc.children));
    }
  }
  return result;
}

export default function BatchQRCodePrint({ locations, onClose }: Props) {
  const allLocations = flattenLocations(locations);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>批量打印位置二维码</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 10mm;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12mm;
            }
            .qr-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 8mm;
              border: 1px solid #e5e7eb;
              border-radius: 4mm;
              page-break-inside: avoid;
            }
            .qr-code {
              width: 120px;
              height: 120px;
            }
            .location-name {
              margin-top: 4mm;
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
              text-align: center;
              word-break: break-all;
            }
            .location-id {
              margin-top: 2mm;
              font-size: 10px;
              color: #6b7280;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${allLocations.map(loc => `
              <div class="qr-item">
                <div class="qr-code">
                  ${new XMLSerializer().serializeToString(document.getElementById(`qr-${loc.id}`) as Element)}
                </div>
                <div class="location-name">${loc.name}</div>
                <div class="location-id">ID: ${loc.id.slice(0, 8)}...</div>
              </div>
            `).join('')}
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
          <h3 className={layoutStyles.modalTitle}>批量打印二维码</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.preview} ref={printRef}>
          <div className={styles.grid}>
            {allLocations.map((loc) => (
              <div key={loc.id} className={styles.qrItem}>
                <QRCodeSVG
                  id={`qr-${loc.id}`}
                  value={`${window.location.origin}/location/${loc.id}`}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
                <div className={styles.locationName}>{loc.name}</div>
                <div className={styles.locationId}>ID: {loc.id.slice(0, 8)}...</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={layoutStyles.btn + ' ' + layoutStyles.btnSecondary} onClick={onClose}>
            关闭
          </button>
          <button className={layoutStyles.btn + ' ' + layoutStyles.btnPrimary} onClick={handlePrint}>
            🖨️ 打印全部
          </button>
        </div>
      </div>
    </div>
  );
}
