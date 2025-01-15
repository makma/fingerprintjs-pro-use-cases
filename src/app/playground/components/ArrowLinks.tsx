import { FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';
import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import Link from 'next/link';
import { FunctionComponent, useEffect, useRef } from 'react';
import { ExternalLinkArrowSvg } from '../../../client/img/externalLinkArrowSvg';
import styles from '../playground.module.scss';
import { TEST_IDS } from '../../../client/testIDs';

export const DocsLink: FunctionComponent<{ children: string; href: string; style?: React.CSSProperties }> = ({
  children,
  href,
  style,
}) => {
  // Prevent the arrow from being the only element on a new line
  const words = children.split(' ');
  const lastWord = [...words].pop();
  const leadingWords = [...words].slice(0, -1).join(' ');
  return (
    <Link href={href} target='_blank' className={styles.docsLink} style={style}>
      {leadingWords}{' '}
      <span style={{ whiteSpace: 'nowrap' }}>
        {lastWord}
        <ExternalLinkArrowSvg className={styles.externalLinkArrow} />
      </span>
    </Link>
  );
};

type PropertyName = keyof EventResponse['products'] | keyof FingerprintJSPro.ExtendedGetResult;

export const JsonLink: FunctionComponent<{
  children: string;
  propertyName: PropertyName;
  elementOrder?: 'first' | 'last';
}> = ({ children, propertyName, elementOrder }) => {
  const timeout = useRef<NodeJS.Timeout | undefined>();

  // Prevent the arrow from being the only element on a new line
  const words = children.split(' ');
  const lastWord = [...words].pop();
  const leadingWords = [...words].slice(0, -1).join(' ');

  // clear timeout when component unmounts
  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <div
      className={styles.jsonLink}
      data-testid={TEST_IDS.playground.jsonLink}
      data-test-property-name={propertyName}
      onClick={() => {
        // scroll to property and highlight it
        const jsonProperties = document.querySelectorAll('.json-view--property');
        const foundElements = Array.from(jsonProperties).filter((el) => el.textContent === propertyName);
        const targetElement =
          elementOrder === 'first'
            ? foundElements[0]
            : (foundElements[foundElements.length - 1] as Element | undefined);
        if (targetElement) {
          if (targetElement.classList.contains(styles.jsonPropertyHighlighted)) {
            targetElement.classList.remove(styles.jsonPropertyHighlighted);
            clearTimeout(timeout.current);
          }
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetElement.classList.add(styles.jsonPropertyHighlighted);
          timeout.current = setTimeout(() => {
            targetElement.classList.remove(styles.jsonPropertyHighlighted);
          }, 5000);
        }
      }}
    >
      {leadingWords}{' '}
      <span style={{ whiteSpace: 'nowrap' }}>
        {lastWord}
        <ExternalLinkArrowSvg className={styles.jsonArrow} />
      </span>
    </div>
  );
};
