import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';

export const vpnDetectionResult = ({ event }: { event: EventResponse | undefined }): string => {
  const VpnData = event?.products.vpn?.data;
  if (!VpnData) {
    return 'Signal not available';
  }
  if (VpnData.result === false) {
    return 'Not detected';
  }
  const reasons = [
    VpnData.methods.publicVPN ? 'public VPN IP' : undefined,
    VpnData.methods.timezoneMismatch ? 'timezone mismatch' : undefined,
    VpnData.methods.osMismatch ? 'OS mismatch' : undefined,
  ].filter(Boolean);
  const reasonsString = reasons.length > 0 ? ` (${reasons.join(', ')})` : '';
  return `You are using a VPN 🌐 ${reasonsString}`;
};
