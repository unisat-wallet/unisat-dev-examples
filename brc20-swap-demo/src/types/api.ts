/**
 * API request and response types for BRC20 swap operations
 */

/**
 * Pool information
 */
export interface Pool {
  id: string;
  name: string;
  tick1: string;
  tick2: string;
  reserve1: string;
  reserve2: string;
  totalSupply: string;
}

/**
 * Quote information for swap
 */
export interface Quote {
  amountIn: string;
  amountOut: string;
  priceImpact: string;
  slippage: string;
}

/**
 * Swap request parameters
 */
export interface SwapRequest {
  poolId: string;
  amountIn: string;
  amountOutMin: string;
  tickIn: string;
  tickOut: string;
  address: string;
}

/**
 * Swap response
 */
export interface SwapResponse {
  success: boolean;
  txid?: string;
  error?: string;
}

/**
 * Pre-operation response with PSBT to sign
 */
export interface PreOperationResponse {
  psbtHex: string;
  feeRate: number;
  inputInfos: Array<{
    txid: string;
    vout: number;
    value: number;
  }>;
}

/**
 * Address balance information
 */
export interface AddressBalance {
  module: string; // In withdrawal queue
  swap: string;
  pendingSwap: string; // Pending deposit confirmation
  pendingAvailable: string; // Pending withdrawal confirmation
}

/**
 * Add liquidity request parameters
 */
export interface AddLiquidityRequest {
  poolId: string;
  amount1: string;
  amount2: string;
  amount1Min: string;
  amount2Min: string;
  address: string;
}

/**
 * Deploy pool request parameters
 */
export interface DeployPoolRequest {
  tick1: string;
  tick2: string;
  initialAmount1: string;
  initialAmount2: string;
  address: string;
}

/**
 * Deploy pool response
 */
export interface DeployPoolResponse {
  success: boolean;
  poolId?: string;
  error?: string;
}
