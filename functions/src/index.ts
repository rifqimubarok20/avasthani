// =============================================================================
// Avasthani - Cloud Functions index (Checkpoint 1: fondasi)
// Fungsi callable akan diimplementasi bertahap:
//   auth, purchase-requests, supplier-responses, quotes, orders,
//   notifications, audit, costs (Design.md section 12).
// Semua fungsi harus memvalidasi identitas, hak akses, payload, dan
// transisi status sebelum menuliskan data (Design.md section 13).
// =============================================================================

import { onRequest } from 'firebase-functions/v2/https';

export { getFertilizerRecommendation } from './ai/recommend';

export const helloWorld = onRequest((response: any) => {
  response.json({ message: 'Avasthani Cloud Functions siap dikembangkan.' });
});
