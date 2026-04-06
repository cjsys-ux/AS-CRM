import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, X, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import thermalBlanketImg from 'figma:asset/ea5c6215da3bc1b3161aba94363aa90a890f52e0.png';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

interface RawOrder {
  amazonPO: string;
  orderDate: string;
  deliveryDate: string;
  totalQty: number;
  shippingCost: number;
}

// All 134 thermal blanket orders sorted chronologically
const RAW_ORDERS: RawOrder[] = [
  // ── July 2024 ──────────────────────────────────────────
  { amazonPO: '2D-14478568', orderDate: '2024-07-19', deliveryDate: '',           totalQty: 980,  shippingCost: 319.08   },
  { amazonPO: '2D-14509182', orderDate: '2024-07-23', deliveryDate: '2024-08-26', totalQty: 456,  shippingCost: 448.87   },
  { amazonPO: '2D-14522860', orderDate: '2024-07-24', deliveryDate: '2024-09-04', totalQty: 10,   shippingCost: 19.21    },
  { amazonPO: '2D-14533477', orderDate: '2024-07-25', deliveryDate: '2024-08-16', totalQty: 100,  shippingCost: 82.10    },
  { amazonPO: '2D-14536117', orderDate: '2024-07-26', deliveryDate: '2024-08-19', totalQty: 6,    shippingCost: 20.00    },
  { amazonPO: '2D-14544188', orderDate: '2024-07-26', deliveryDate: '2024-08-16', totalQty: 100,  shippingCost: 94.00    },
  { amazonPO: '2D-14545070', orderDate: '2024-07-26', deliveryDate: '2024-08-19', totalQty: 1144, shippingCost: 810.96   },
  // ── August 2024 ─────────────────────────────────────────
  { amazonPO: '2D-14622821', orderDate: '2024-08-05', deliveryDate: '2024-08-19', totalQty: 200,  shippingCost: 244.70   },
  { amazonPO: '2D-14679718', orderDate: '2024-08-12', deliveryDate: '2024-08-19', totalQty: 7,    shippingCost: 18.33    },
  { amazonPO: '2D-14686432', orderDate: '2024-08-12', deliveryDate: '2024-08-22', totalQty: 350,  shippingCost: 241.69   },
  { amazonPO: '2D-14692671', orderDate: '2024-08-13', deliveryDate: '2024-08-23', totalQty: 100,  shippingCost: 186.64   },
  { amazonPO: '2D-14701633', orderDate: '2024-08-14', deliveryDate: '',           totalQty: 1824, shippingCost: 870.96   },
  { amazonPO: '2D-14716313', orderDate: '2024-08-15', deliveryDate: '2024-08-24', totalQty: 40,   shippingCost: 43.00    },
  { amazonPO: '2D-14738500', orderDate: '2024-08-19', deliveryDate: '2024-08-28', totalQty: 100,  shippingCost: 82.00    },
  { amazonPO: '2D-14762854', orderDate: '2024-08-21', deliveryDate: '2024-08-30', totalQty: 20,   shippingCost: 21.56    },
  { amazonPO: '2D-14782782', orderDate: '2024-08-23', deliveryDate: '2024-08-30', totalQty: 10,   shippingCost: 19.30    },
  { amazonPO: '2D-14790955', orderDate: '2024-08-23', deliveryDate: '2024-10-18', totalQty: 112,  shippingCost: 214.85   },
  { amazonPO: '2D-14844663', orderDate: '2024-08-29', deliveryDate: '2024-11-07', totalQty: 100,  shippingCost: 76.14    },
  { amazonPO: '2D-14845246', orderDate: '2024-08-29', deliveryDate: '2024-10-21', totalQty: 50,   shippingCost: 0.00     },
  { amazonPO: '2D-14855617', orderDate: '2024-08-30', deliveryDate: '2024-09-09', totalQty: 100,  shippingCost: 86.72    },
  { amazonPO: '2D-14859035', orderDate: '2024-08-31', deliveryDate: '2024-09-09', totalQty: 10,   shippingCost: 13.96    },
  // ── September 2024 ──────────────────────────────────────
  { amazonPO: '2D-14881238', orderDate: '2024-09-03', deliveryDate: '2024-09-16', totalQty: 100,  shippingCost: 84.82    },
  { amazonPO: '2D-14894075', orderDate: '2024-09-04', deliveryDate: '2024-09-16', totalQty: 50,   shippingCost: 62.11    },
  { amazonPO: '2D-14895909', orderDate: '2024-09-04', deliveryDate: '2024-09-16', totalQty: 114,  shippingCost: 84.80    },
  { amazonPO: '2D-14912555', orderDate: '2024-09-05', deliveryDate: '2024-09-18', totalQty: 60,   shippingCost: 114.18   },
  { amazonPO: '2D-14933661', orderDate: '2024-09-09', deliveryDate: '2024-09-18', totalQty: 100,  shippingCost: 475.78   },
  { amazonPO: '2D-14935573', orderDate: '2024-09-09', deliveryDate: '2024-09-23', totalQty: 660,  shippingCost: 543.84   },
  { amazonPO: '2D-14936237', orderDate: '2024-09-09', deliveryDate: '2024-09-18', totalQty: 100,  shippingCost: 475.78   },
  { amazonPO: '2D-14945066', orderDate: '2024-09-10', deliveryDate: '2024-09-18', totalQty: 100,  shippingCost: 475.78   },
  { amazonPO: '2D-14945688', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14945741', orderDate: '2024-09-10', deliveryDate: '2024-09-18', totalQty: 100,  shippingCost: 475.78   },
  { amazonPO: '2D-14945743', orderDate: '2024-09-10', deliveryDate: '2024-09-18', totalQty: 100,  shippingCost: 475.78   },
  { amazonPO: '2D-14945744', orderDate: '2024-09-10', deliveryDate: '2024-09-18', totalQty: 100,  shippingCost: 475.78   },
  { amazonPO: '2D-14945745', orderDate: '2024-09-10', deliveryDate: '2024-09-18', totalQty: 100,  shippingCost: 475.78   },
  { amazonPO: '2D-14945771', orderDate: '2024-09-10', deliveryDate: '2024-09-18', totalQty: 100,  shippingCost: 475.78   },
  { amazonPO: '2D-14945786', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14945790', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14945854', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14947555', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14947791', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14947881', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14948011', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14948156', orderDate: '2024-09-10', deliveryDate: '2024-10-02', totalQty: 100,  shippingCost: 619.35   },
  { amazonPO: '2D-14974794', orderDate: '2024-09-12', deliveryDate: '2024-10-02', totalQty: 50,   shippingCost: 619.35   },
  { amazonPO: '2D-14981998', orderDate: '2024-09-13', deliveryDate: '',           totalQty: 24,   shippingCost: 95.80    },
  { amazonPO: '2D-15017143', orderDate: '2024-09-17', deliveryDate: '2024-09-30', totalQty: 100,  shippingCost: 64.51    },
  { amazonPO: '2D-15047663', orderDate: '2024-09-20', deliveryDate: '2024-10-01', totalQty: 50,   shippingCost: 41.93    },
  { amazonPO: '2D-15049781', orderDate: '2024-09-20', deliveryDate: '2024-10-01', totalQty: 100,  shippingCost: 65.23    },
  { amazonPO: '2D-15049810', orderDate: '2024-09-20', deliveryDate: '2024-10-18', totalQty: 50,   shippingCost: 32.66    },
  { amazonPO: '2D-15055640', orderDate: '2024-09-20', deliveryDate: '2024-09-30', totalQty: 980,  shippingCost: 332.00   },
  { amazonPO: '2D-15064053', orderDate: '2024-09-23', deliveryDate: '2024-09-30', totalQty: 40,   shippingCost: 25.14    },
  { amazonPO: '2D-15064093', orderDate: '2024-09-23', deliveryDate: '2024-09-30', totalQty: 40,   shippingCost: 25.14    },
  { amazonPO: '2D-15069737', orderDate: '2024-09-23', deliveryDate: '2024-09-30', totalQty: 3,    shippingCost: 12.57    },
  { amazonPO: '2D-15078829', orderDate: '2024-09-24', deliveryDate: '2024-10-01', totalQty: 10,   shippingCost: 15.05    },
  { amazonPO: '2D-15093656', orderDate: '2024-09-25', deliveryDate: '2024-10-02', totalQty: 75,   shippingCost: 108.18   },
  { amazonPO: '2D-15098171', orderDate: '2024-09-25', deliveryDate: '2024-10-02', totalQty: 50,   shippingCost: 41.93    },
  { amazonPO: '2D-15105274', orderDate: '2024-09-26', deliveryDate: '',           totalQty: 250,  shippingCost: 275.00   },
  { amazonPO: '2D-15123156', orderDate: '2024-09-27', deliveryDate: '2024-10-09', totalQty: 50,   shippingCost: 48.08    },
  { amazonPO: '2D-15128824', orderDate: '2024-09-29', deliveryDate: '',           totalQty: 15,   shippingCost: 14.63    },
  { amazonPO: '2D-15137251', orderDate: '2024-09-30', deliveryDate: '2024-10-11', totalQty: 5,    shippingCost: 18.55    },
  { amazonPO: '2D-15141410', orderDate: '2024-09-30', deliveryDate: '2024-10-08', totalQty: 100,  shippingCost: 58.64    },
  { amazonPO: '2D-15141591', orderDate: '2024-09-30', deliveryDate: '2024-10-10', totalQty: 50,   shippingCost: 49.20    },
  // ── October 2024 ────────────────────────────────────────
  { amazonPO: '2D-15153607', orderDate: '2024-10-01', deliveryDate: '2024-10-11', totalQty: 100,  shippingCost: 156.17   },
  { amazonPO: '2D-15168723', orderDate: '2024-10-02', deliveryDate: '',           totalQty: 228,  shippingCost: 351.80   },
  { amazonPO: '2D-15169410', orderDate: '2024-10-02', deliveryDate: '2024-10-21', totalQty: 90,   shippingCost: 238.00   },
  { amazonPO: '2D-15173291', orderDate: '2024-10-03', deliveryDate: '',           totalQty: 20,   shippingCost: 35.02    },
  { amazonPO: '2D-15185373', orderDate: '2024-10-04', deliveryDate: '',           totalQty: 4,    shippingCost: 12.65    },
  { amazonPO: '2D-15196269', orderDate: '2024-10-04', deliveryDate: '',           totalQty: 50,   shippingCost: 24.50    },
  { amazonPO: '2D-15197243', orderDate: '2024-10-04', deliveryDate: '',           totalQty: 6,    shippingCost: 10.66    },
  { amazonPO: '2D-15201823', orderDate: '2024-10-06', deliveryDate: '',           totalQty: 114,  shippingCost: 191.05   },
  { amazonPO: '2D-15211378', orderDate: '2024-10-07', deliveryDate: '',           totalQty: 100,  shippingCost: 249.48   },
  { amazonPO: '2D-15217714', orderDate: '2024-10-08', deliveryDate: '',           totalQty: 52,   shippingCost: 109.52   },
  { amazonPO: '2D-15225061', orderDate: '2024-10-08', deliveryDate: '',           totalQty: 40,   shippingCost: 114.78   },
  { amazonPO: '2D-15245500', orderDate: '2024-10-09', deliveryDate: '2024-10-18', totalQty: 50,   shippingCost: 32.66    },
  { amazonPO: '5Z-14574403', orderDate: '2024-10-09', deliveryDate: '2024-09-16', totalQty: 980,  shippingCost: 1060.75  },
  { amazonPO: '5Z-14574417', orderDate: '2024-10-10', deliveryDate: '2024-09-10', totalQty: 506,  shippingCost: 574.67   },
  { amazonPO: '2D-15266049', orderDate: '2024-10-11', deliveryDate: '',           totalQty: 185,  shippingCost: 426.96   },
  { amazonPO: '2D-15271873', orderDate: '2024-10-11', deliveryDate: '',           totalQty: 50,   shippingCost: 55.60    },
  { amazonPO: '2D-15272045', orderDate: '2024-10-11', deliveryDate: '',           totalQty: 50,   shippingCost: 55.60    },
  { amazonPO: '2D-15292433', orderDate: '2024-10-14', deliveryDate: '',           totalQty: 24,   shippingCost: 31.20    },
  { amazonPO: '2D-15302175', orderDate: '2024-10-15', deliveryDate: '2024-10-18', totalQty: 100,  shippingCost: 12.67    },
  { amazonPO: '2D-15306784', orderDate: '2024-10-15', deliveryDate: '',           totalQty: 342,  shippingCost: 342.00   },
  { amazonPO: '2D-15315329', orderDate: '2024-10-16', deliveryDate: '2024-11-08', totalQty: 100,  shippingCost: 95.12    },
  { amazonPO: '2D-15315655', orderDate: '2024-10-16', deliveryDate: '2024-11-08', totalQty: 100,  shippingCost: 19.06    },
  { amazonPO: '2D-15316248', orderDate: '2024-10-16', deliveryDate: '2024-11-08', totalQty: 100,  shippingCost: 126.65   },
  { amazonPO: '2D-15355624', orderDate: '2024-10-21', deliveryDate: '2024-11-08', totalQty: 50,   shippingCost: 47.55    },
  { amazonPO: '2D-15376850', orderDate: '2024-10-22', deliveryDate: '2024-11-12', totalQty: 50,   shippingCost: 73.90    },
  { amazonPO: '2D-15381494', orderDate: '2024-10-23', deliveryDate: '2024-11-11', totalQty: 4,    shippingCost: 12.14    },
  { amazonPO: '2D-15383609', orderDate: '2024-10-23', deliveryDate: '2024-11-07', totalQty: 150,  shippingCost: 27.10    },
  { amazonPO: '2D-15412555', orderDate: '2024-10-25', deliveryDate: '2024-11-08', totalQty: 100,  shippingCost: 115.19   },
  { amazonPO: '2D-15420465', orderDate: '2024-10-27', deliveryDate: '2024-11-07', totalQty: 160,  shippingCost: 108.59   },
  { amazonPO: '2D-15427770', orderDate: '2024-10-28', deliveryDate: '2024-11-08', totalQty: 50,   shippingCost: 47.55    },
  { amazonPO: '2D-15428732', orderDate: '2024-10-28', deliveryDate: '2024-11-08', totalQty: 2,    shippingCost: 12.13    },
  { amazonPO: '2D-15445339', orderDate: '2024-10-29', deliveryDate: '2024-11-12', totalQty: 100,  shippingCost: 20.40    },
  { amazonPO: '2D-15451927', orderDate: '2024-10-30', deliveryDate: '2024-11-08', totalQty: 10,   shippingCost: 12.91    },
  // ── November 2024 ───────────────────────────────────────
  { amazonPO: '2D-15477781', orderDate: '2024-11-01', deliveryDate: '2024-11-08', totalQty: 20,   shippingCost: 17.70    },
  { amazonPO: '2D-15483147', orderDate: '2024-11-01', deliveryDate: '2025-12-18', totalQty: 400,  shippingCost: 222.37   },
  { amazonPO: '2D-15506962', orderDate: '2024-11-05', deliveryDate: '2024-11-21', totalQty: 15,   shippingCost: 12.57    },
  { amazonPO: '2D-15525178', orderDate: '2024-11-06', deliveryDate: '2024-11-21', totalQty: 70,   shippingCost: 59.76    },
  { amazonPO: '2D-15533469', orderDate: '2024-11-06', deliveryDate: '2024-11-25', totalQty: 60,   shippingCost: 54.81    },
  { amazonPO: '2D-15549570', orderDate: '2024-11-08', deliveryDate: '2024-11-21', totalQty: 50,   shippingCost: 30.86    },
  { amazonPO: '2D-15556882', orderDate: '2024-11-08', deliveryDate: '2024-11-25', totalQty: 100,  shippingCost: 100.80   },
  { amazonPO: '2D-15573816', orderDate: '2024-11-11', deliveryDate: '2024-11-25', totalQty: 50,   shippingCost: 30.86    },
  { amazonPO: '2D-15590558', orderDate: '2024-11-12', deliveryDate: '2024-11-25', totalQty: 112,  shippingCost: 143.07   },
  { amazonPO: '2D-15633387', orderDate: '2024-11-15', deliveryDate: '2024-11-25', totalQty: 150,  shippingCost: 130.86   },
  { amazonPO: '2D-15638620', orderDate: '2024-11-18', deliveryDate: '2024-11-21', totalQty: 10,   shippingCost: 12.57    },
  { amazonPO: '2D-15678113', orderDate: '2024-11-20', deliveryDate: '2024-12-17', totalQty: 60,   shippingCost: 49.23    },
  { amazonPO: '2D-15678210', orderDate: '2024-11-20', deliveryDate: '2024-12-20', totalQty: 100,  shippingCost: 64.26    },
  { amazonPO: '2D-15680060', orderDate: '2024-11-20', deliveryDate: '2024-12-20', totalQty: 200,  shippingCost: 9.15     },
  { amazonPO: '2D-15694191', orderDate: '2024-11-21', deliveryDate: '2024-12-20', totalQty: 80,   shippingCost: 73.55    },
  { amazonPO: '2D-15783636', orderDate: '2024-11-29', deliveryDate: '2024-12-20', totalQty: 200,  shippingCost: 85.16    },
  { amazonPO: '2D-15789380', orderDate: '2024-11-30', deliveryDate: '2024-12-19', totalQty: 40,   shippingCost: 62.00    },
  // ── December 2024 ───────────────────────────────────────
  { amazonPO: '2D-15836449', orderDate: '2024-12-04', deliveryDate: '2024-12-17', totalQty: 20,   shippingCost: 22.49    },
  { amazonPO: '2D-15851811', orderDate: '2024-12-05', deliveryDate: '2025-01-02', totalQty: 426,  shippingCost: 507.59   },
  { amazonPO: '2D-15860250', orderDate: '2024-12-06', deliveryDate: '2025-01-02', totalQty: 100,  shippingCost: 168.80   },
  { amazonPO: '2D-15864106', orderDate: '2024-12-06', deliveryDate: '2025-01-06', totalQty: 100,  shippingCost: 85.82    },
  { amazonPO: '2D-15877498', orderDate: '2024-12-09', deliveryDate: '2025-01-03', totalQty: 100,  shippingCost: 61.72    },
  { amazonPO: '2D-15946148', orderDate: '2024-12-13', deliveryDate: '2024-12-20', totalQty: 50,   shippingCost: 46.26    },
  { amazonPO: '2D-15946679', orderDate: '2024-12-13', deliveryDate: '2025-01-07', totalQty: 280,  shippingCost: 225.36   },
  { amazonPO: '2D-15949803', orderDate: '2024-12-16', deliveryDate: '2024-12-31', totalQty: 500,  shippingCost: 446.57   },
  { amazonPO: '2D-15963651', orderDate: '2024-12-16', deliveryDate: '2025-01-04', totalQty: 200,  shippingCost: 117.29   },
  { amazonPO: '2D-15971777', orderDate: '2024-12-16', deliveryDate: '2025-01-09', totalQty: 720,  shippingCost: 625.38   },
  { amazonPO: '2D-15983197', orderDate: '2024-12-17', deliveryDate: '2025-01-09', totalQty: 10,   shippingCost: 16.03    },
  { amazonPO: '2D-16009679', orderDate: '2024-12-19', deliveryDate: '2025-01-10', totalQty: 20,   shippingCost: 21.38    },
  { amazonPO: '2D-16018294', orderDate: '2024-12-19', deliveryDate: '2025-01-09', totalQty: 200,  shippingCost: 131.43   },
  { amazonPO: '2D-16048818', orderDate: '2024-12-23', deliveryDate: '2025-01-09', totalQty: 114,  shippingCost: 86.91    },
  { amazonPO: '2D-16055622', orderDate: '2024-12-23', deliveryDate: '2025-01-22', totalQty: 819,  shippingCost: 357.50   },
  { amazonPO: '2D-16063511', orderDate: '2024-12-24', deliveryDate: '2025-01-03', totalQty: 100,  shippingCost: 58.64    },
  { amazonPO: '2D-16064823', orderDate: '2024-12-24', deliveryDate: '2025-01-22', totalQty: 200,  shippingCost: 140.25   },
  { amazonPO: '2D-16075459', orderDate: '2024-12-26', deliveryDate: '2025-01-09', totalQty: 50,   shippingCost: 22.64    },
  // ── January 2025 ────────────────────────────────────────
  { amazonPO: 'B187-16190658', orderDate: '2025-01-09', deliveryDate: '2025-01-24', totalQty: 20, shippingCost: 23.30   },
  { amazonPO: 'FK-16310556',   orderDate: '2025-01-21', deliveryDate: '2025-02-07', totalQty: 50, shippingCost: 91.71   },
  // ── February 2025 ───────────────────────────────────────
  { amazonPO: 'FK-16601475',   orderDate: '2025-02-19', deliveryDate: '2025-02-27', totalQty: 30, shippingCost: 57.34   },
  // ── October 2025 ────────────────────────────────────────
  { amazonPO: 'FK-18967067',   orderDate: '2025-10-08', deliveryDate: '',           totalQty: 80, shippingCost: 169.23  },
];

// ── Helpers ──────────────────────────────────────────────

function genInvoice(orderDate: string, counters: Map<string, number>): string {
  const d = new Date(orderDate);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const key = `ASI-${yyyy}${mm}`;
  const next = (counters.get(key) || 0) + 1;
  counters.set(key, next);
  return `${key}-${String(next).padStart(3, '0')}`;
}

function buildOrder(raw: RawOrder, counters: Map<string, number>) {
  const amazonPPU = 9.90;
  const productCostPPU = 4.95;
  const { totalQty, shippingCost, orderDate, deliveryDate, amazonPO } = raw;

  const amazonShippingRevenue = parseFloat((shippingCost * 1.30).toFixed(2));
  const amazonProductRevenue  = parseFloat((totalQty * amazonPPU).toFixed(2));
  const totalAmazonRevenue    = parseFloat((amazonProductRevenue + amazonShippingRevenue).toFixed(2));
  const totalProductCost      = parseFloat((totalQty * productCostPPU).toFixed(2));
  const totalCost             = parseFloat((totalProductCost + shippingCost).toFixed(2));
  const totalProfit           = parseFloat((totalAmazonRevenue - totalCost).toFixed(2));
  const gpMargin              = totalAmazonRevenue > 0 ? parseFloat(((totalProfit / totalAmazonRevenue) * 100).toFixed(2)) : 0;
  const ipfProfit             = parseFloat((totalProfit / 2).toFixed(2));
  const activateProfit        = parseFloat((totalProfit / 2).toFixed(2));
  const grossProfitPPU        = amazonPPU - productCostPPU; // 4.95
  const activateSwagPPU       = parseFloat((productCostPPU + grossProfitPPU * 0.5).toFixed(4)); // 7.425
  const activateSwagRevenue   = parseFloat((activateSwagPPU * totalQty).toFixed(2));
  const activateProductRev    = totalProductCost;
  const activateShippingRev   = parseFloat((shippingCost + amazonShippingRevenue).toFixed(2));

  let payoutDate = '';
  if (deliveryDate) {
    const d = new Date(deliveryDate);
    d.setDate(d.getDate() + 90);
    payoutDate = d.toISOString().split('T')[0];
  }

  return {
    activateSwagInvoice: genInvoice(orderDate, counters),
    amazonPO,
    orderDate,
    deliveryDate,
    payoutDate,
    totalQty,
    singleQty: totalQty,
    hasSizeVariants: false,
    sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
    orderType: 'inventory',
    productName: 'Thermal Blanket',
    productId: '',
    image: thermalBlanketImg,
    amazonPPU,
    productCostPPU,
    amazonShippingRevenue,
    amazonProductRevenue,
    totalAmazonRevenue,
    totalProductCost,
    shippingCost,
    totalCost,
    totalProfit,
    gpMargin,
    ipfProfit,
    activateProfit,
    activateSwagPPU,
    activateSwagRevenue,
    activateProductRev,
    activateShippingRev,
    amazonPaid: false,
  };
}

// Pre-compute summary stats
const TOTAL_QTY = RAW_ORDERS.reduce((s, o) => s + o.totalQty, 0);
const TOTAL_SHIPPING = RAW_ORDERS.reduce((s, o) => s + o.shippingCost, 0);

// ── Component ────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AmazonOrderSeeder({ isOpen, onClose, onSuccess }: Props) {
  const [phase, setPhase] = useState<'preview' | 'importing' | 'done'>('preview');
  const [done, setDone] = useState(0);
  const [errors, setErrors] = useState(0);

  const total = RAW_ORDERS.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleImport = async () => {
    setPhase('importing');
    setDone(0);
    setErrors(0);

    // Sort by orderDate to ensure correct invoice numbering
    const sorted = [...RAW_ORDERS].sort((a, b) => a.orderDate.localeCompare(b.orderDate));
    const counters = new Map<string, number>();
    let errCount = 0;

    // Post in batches of 5 for speed
    const BATCH = 5;
    for (let i = 0; i < sorted.length; i += BATCH) {
      const batch = sorted.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (raw) => {
          const order = buildOrder(raw, counters);
          try {
            const res = await fetch(`${API_URL}/amazon-orders`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(order),
            });
            const data = await res.json();
            if (!data.success) {
              console.error(`Failed to import ${raw.amazonPO}:`, data.error);
              errCount++;
            }
          } catch (err) {
            console.error(`Error importing ${raw.amazonPO}:`, err);
            errCount++;
          }
        })
      );
      setDone(Math.min(i + BATCH, sorted.length));
      setErrors(errCount);
    }

    setPhase('done');
    if (errCount === 0) {
      toast.success(`Successfully imported all ${total} Thermal Blanket orders!`);
    } else {
      toast.error(`Imported with ${errCount} error(s) — check console for details`);
    }
    onSuccess();
  };

  const handleClose = () => {
    if (phase === 'importing') return; // block close during import
    setPhase('preview');
    setDone(0);
    setErrors(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Bulk Import Orders</h2>
                  <p className="text-xs text-slate-400">Thermal Blanket · Amazon Distribution</p>
                </div>
              </div>
              {phase !== 'importing' && (
                <button onClick={handleClose} className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-300" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-6">

              {/* Product preview */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-5">
                <img
                  src={thermalBlanketImg}
                  alt="Thermal Blanket"
                  className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-white p-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900">Thermal Blanket</p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Inventory</span>
                    <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Amazon PPU: $9.90</span>
                    <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">Cost PPU: $4.95</span>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">Activate PPU: $7.43</span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                  <p className="text-2xl font-black text-slate-900">{total}</p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Orders</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                  <p className="text-2xl font-black text-slate-900">{TOTAL_QTY.toLocaleString()}</p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Total Units</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                  <p className="text-2xl font-black text-slate-900">${(TOTAL_SHIPPING / 1000).toFixed(1)}k</p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Ship Cost</p>
                </div>
              </div>

              {/* Date range note */}
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                <Package className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-semibold">
                  Covers Jul 2024 → Oct 2025 · Invoice numbers auto-generated per order month (ASI-YYYYMM-###) · Payout = delivery + 90 days
                </p>
              </div>

              {/* Progress (shown during import and after) */}
              {(phase === 'importing' || phase === 'done') && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">
                      {phase === 'done' ? 'Import Complete' : 'Importing…'}
                    </span>
                    <span className="text-sm font-black text-slate-900">{done} / {total}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${errors > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-slate-400">{pct}% complete</span>
                    {errors > 0 && (
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors} error(s)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Done state message */}
              {phase === 'done' && (
                <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${errors === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                  {errors === 0
                    ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
                  <p className={`text-sm font-semibold ${errors === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {errors === 0
                      ? `All ${total} orders imported successfully!`
                      : `${total - errors} succeeded, ${errors} failed — check console`}
                  </p>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3">
                {phase !== 'importing' && (
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    {phase === 'done' ? 'Close' : 'Cancel'}
                  </button>
                )}

                {phase === 'preview' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleImport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Import {total} Orders
                  </motion.button>
                )}

                {phase === 'importing' && (
                  <button
                    disabled
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-400 text-white font-bold rounded-xl cursor-not-allowed opacity-80"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing…
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
