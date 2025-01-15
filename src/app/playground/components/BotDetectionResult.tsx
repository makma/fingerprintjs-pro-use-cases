import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';

const botDetectionResult = ({ event }: { event: EventResponse | undefined }): string => {
  switch (event?.products.botd?.data?.bot.result) {
    case 'good':
      return 'You are a good bot 🤖';
    case 'bad':
      return `You are a bad bot 🤖 (type: ${event.products.botd.data.bot.type})`;
    case 'notDetected':
      return 'Not detected';
    default:
      return 'Unknown';
  }
};

export default botDetectionResult;
