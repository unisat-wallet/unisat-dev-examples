export function isTapRoot(address: string) {
  return address.startsWith("tb1p") || address.startsWith("bc1p");
}

// Native segwit
export function isP2WPKH(address: string) {
  return address.startsWith("tb1q") || address.startsWith("bc1q");
}
