import Link from 'next/link';
import { FunctionComponent } from 'react';
import Image from 'next/image';
import BackArrowSvg from '../../img/arrowLeft.svg';
import styles from './BackArrow.module.scss';
import classNames from 'classnames';

type Props = {
  label: string;
  testId?: string;
  className?: string;
} & ({ as: 'Link'; href: string } | { as: 'button'; onClick: () => void });

export const BackArrow: FunctionComponent<Props> = ({ label, testId, className, ...props }) => {
  const content = (
    <>
      <Image src={BackArrowSvg} alt='' className={styles.backArrow} />
      {label}
    </>
  );
  return (
    <div className={classNames(styles.buckButton, className)} data-testid={testId}>
      {props.as === 'Link' && (
        <Link
          href={props.href}
          // Do not scroll to top, keep the demo view (demo browser) in view
          scroll={false}
        >
          {content}
        </Link>
      )}
      {props.as === 'button' && <div onClick={props.onClick}>{content}</div>}
    </div>
  );
};
