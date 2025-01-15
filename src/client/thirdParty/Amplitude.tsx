import * as amplitude from '@amplitude/analytics-browser';
import { usePlaygroundSignals } from '../../app/playground/hooks/usePlaygroundSignals';
import { FunctionComponent } from 'react';

const AMPLITUDE_INGRESS_PROXY = 'https://demo.fingerprint.com/ampl-api/2/httpapi';
const AMPLITUDE_EVENT = {
  DEMO_PAGE_VIEWED: 'Demo Page Viewed',
  DEMO_ASK_AI_HELP_CHOSEN: 'Demo Ask AI Help Chosen',
} as const;

/**
 * This is an Amplitude plugin that renames the Page view event_properties according to our analytics needs
 */
const demoPageViewedEventPropertiesEnrichment = (botDetected: 'True' | 'False'): amplitude.Types.EnrichmentPlugin => ({
  name: 'custom-event-properties-enrichment',
  type: 'enrichment',
  setup: async () => undefined,
  execute: async (event) => {
    // Only apply to Demo Page View events
    if (event.event_type !== AMPLITUDE_EVENT.DEMO_PAGE_VIEWED) {
      return event;
    }

    // Rename event properties
    const originalEventProperties = event.event_properties;
    event.event_properties = {
      'Demo Page Domain': originalEventProperties?.['[Amplitude] Page Domain'],
      'Demo Page Location': originalEventProperties?.['[Amplitude] Page Location'],
      'Demo Page Path': originalEventProperties?.['[Amplitude] Page Path'],
      'Demo Page Title': originalEventProperties?.['[Amplitude] Page Title'],
      'Demo Page URL': originalEventProperties?.['[Amplitude] Page URL'],
      botDetected,
    };
    return event;
  },
});

type AmplitudeProps = {
  apiKey: string;
};

type AskAIHelpChosenEventProperties = {
  helpMethod: string;
  'Demo Page Path': string;
  'Demo Page Title': string;
};

export function trackAskAIHelpChosen(properties: AskAIHelpChosenEventProperties) {
  amplitude.track(AMPLITUDE_EVENT.DEMO_ASK_AI_HELP_CHOSEN, properties);
}

export const Amplitude: FunctionComponent<AmplitudeProps> = ({ apiKey }) => {
  usePlaygroundSignals({
    onServerApiSuccess: (event) => {
      const visitorId = event.products.identification?.data?.visitorId;
      const botDetected = event.products.botd?.data?.bot.result === 'bad' ? 'True' : 'False';

      amplitude.add(demoPageViewedEventPropertiesEnrichment(botDetected));
      amplitude.init(apiKey, {
        defaultTracking: {
          pageViews: {
            eventType: AMPLITUDE_EVENT.DEMO_PAGE_VIEWED,
          },
          attribution: false,
          sessions: false,
          formInteractions: false,
          fileDownloads: false,
        },
        deviceId: visitorId,
        serverUrl: AMPLITUDE_INGRESS_PROXY,
      });

      // Set Amplify user's custom `botDetected` property based on Fingerprint Bot Detection result
      const identifyEvent = new amplitude.Identify();
      identifyEvent.set('botDetected', botDetected);
      amplitude.identify(identifyEvent);
    },
  });

  return null;
};
