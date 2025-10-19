/**
 * Session lifetime in milliseconds (24 hours).
 *
 * @constant
 * @default 86,400,000 ms
 * @remarks
 * - Keeps sessions short-lived to reduce stale data and exposure surface.
 */ 
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Auto-refresh threshold in milliseconds (4 hours).
 *
 * @constant
 * @default 14,400,000 ms
 * @remarks
 * - Sessions should be refreshed when they fall below this threshold.
 */
export const AUTO_REFRESH_THRESHOLD_MS = 4 * 60 * 60 * 1000;