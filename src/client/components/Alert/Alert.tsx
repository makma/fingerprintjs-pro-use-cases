import { FunctionComponent, PropsWithChildren } from 'react';
import SuccessIcon from './success.svg';
import ErrorIcon from './error.svg';
import WarningIcon from './warning.svg';
import InfoIcon from '../../img/InfoIconSvg.svg';
import styles from './alert.module.scss';
import Image from 'next/image';
import classNames from 'classnames';
import { TEST_ATTRIBUTES, TEST_IDS } from '../../testIDs';
import { CustomContentProps, VariantType, useSnackbar, SnackbarKey } from 'notistack';
import React from 'react';
import Button from '../Button/Button';
import { CrossIconSvg } from '../../img/crossIconSvg';
import { Severity } from '../../../server/checks';

type AlertProps = {
  severity: Severity;
  className?: string;
  dataTestId?: string;
} & PropsWithChildren;

const STYLES_MAP: Record<VariantType, keyof typeof styles> = {
  error: styles.error,
  warning: styles.warning,
  success: styles.success,
  default: styles.info,
  info: styles.info,
};

export const ALERT_ICON_MAP: Record<VariantType, any> = {
  error: <Image src={ErrorIcon} alt='' />,
  warning: <Image src={WarningIcon} alt='' />,
  success: <Image src={SuccessIcon} alt='' />,
  default: <Image src={InfoIcon} alt='' />,
  info: <Image src={InfoIcon} alt='' width={24} height={24} style={{ padding: '2px' }} />,
};

/**
 * Static on-page alert/notification
 */
export const Alert: FunctionComponent<AlertProps & { onClose?: () => void }> = ({
  severity,
  children,
  className,
  dataTestId,
  onClose,
}) => {
  const testAttributes = {
    'data-testid': classNames(TEST_IDS.common.alert, dataTestId),
    [TEST_ATTRIBUTES.severity]: severity,
  };
  return (
    <div className={classNames(styles.alert, STYLES_MAP[severity], className)} {...testAttributes}>
      {onClose && (
        <div className={styles.alertCloseIcon} onClick={onClose}>
          x
        </div>
      )}
      <div className={styles.iconWrapper}>{ALERT_ICON_MAP[severity]}</div>
      <div>{children}</div>
    </div>
  );
};

/**
 * Custom `notistack` snackbar/popup (visually similar to the static alert above, but a separate component)
 */
export const CustomSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const {
    // You have access to notistack props and options 👇🏼
    id,
    action,
    message,
    variant,
    className,
    ...other
  } = props;

  const testAttributes = {
    [TEST_ATTRIBUTES.id]: TEST_IDS.common.snackBar,
    [TEST_ATTRIBUTES.severity]: variant,
  };

  return (
    <div
      ref={ref}
      role='alert'
      className={classNames(styles.snackbar, styles.withBorder, STYLES_MAP[variant], className)}
      {...testAttributes}
      {...other}
    >
      <div className={styles.snackbarContent}>
        <div className={styles.iconWrapper}>{ALERT_ICON_MAP[variant]}</div>
        <div className={styles.message}>{message}</div>
      </div>
      <div className={styles.snackbarActions}>{typeof action === 'function' ? action(id) : action}</div>
    </div>
  );
});

CustomSnackbar.displayName = 'CustomSnackbar';

export function CloseSnackbarButton({ snackbarId }: { snackbarId: SnackbarKey }) {
  const { closeSnackbar } = useSnackbar();

  return (
    <>
      <div className={styles.closeIcon}>
        <CrossIconSvg data-testid={TEST_IDS.common.closeSnackbar} onClick={() => closeSnackbar(snackbarId)} />
      </div>
      <Button
        onClick={() => closeSnackbar(snackbarId)}
        data-testid={TEST_IDS.common.closeSnackbar}
        className={styles.closeButton}
        variant='ghost'
        outlined
        size='small'
      >
        CLOSE
      </Button>
    </>
  );
}
