export interface Prize {
  id: string;
  name: string;
  active: boolean;
  /**
   * Remaining stock. Counts down by 1 on every win; at 0 the prize drops out
   * of the draw automatically. `null` means unlimited — always available and
   * never decrements (e.g. the Sterrenbonus vouchers).
   */
  stock: number | null;
  /** Starting stock, kept for the admin "12 / 1550" display. */
  initialStock: number | null;
}
