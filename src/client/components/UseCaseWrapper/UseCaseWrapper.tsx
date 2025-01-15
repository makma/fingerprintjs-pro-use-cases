'use client';

import { ElementRef, FunctionComponent, useRef, useState } from 'react';
import Container from '../Container';
import styles from './UseCaseWrapper.module.scss';
import Button from '../Button/Button';
import Lightbulb from './lightbulb.svg';
import Image from 'next/image';
import { Tooltip } from '@mui/material';
import { UseCase } from '../../content';
import ExternalLinkIcon from '../../img/externalLinkArrow.svg';
import RestartIcon from '../../img/restart.svg';
import { useReset } from '../../hooks/useReset/useReset';
import classNames from 'classnames';
import { RestartHint } from './RestartHint';
import { TEST_IDS } from '../../testIDs';
import { FancyNumberedList } from '../FancyNumberedList/FancyNumberedList';
import { ResourceLinks } from '../ResourceLinks/ResourceLinks';

export const INSTRUCTION_ANCHOR_ID = 'instructions';

type UseCaseWrapperProps = {
  useCase: Partial<UseCase>;
  children: React.ReactNode;
  hideGithubLink?: boolean;
  returnUrl?: string;
  embed?: boolean;
  instructionsNote?: string;
  noInnerPadding?: boolean;
};

export const UseCaseWrapper: FunctionComponent<UseCaseWrapperProps> = ({
  children,
  hideGithubLink: hideSrcListItem = false,
  useCase,
  embed,
  instructionsNote,
  noInnerPadding,
}) => {
  const { title, description, articleUrl, instructions, moreResources, doNotMentionResetButton } = useCase;
  const learnMoreRef = useRef<ElementRef<'h3'>>(null);

  const { mutate, shouldDisplayResetButton, isLoading } = useReset({});
  const [pulseResetButton, setPulseResetButton] = useState(false);

  const moreResourcesPresent = moreResources && moreResources.length > 0;

  const howToInstructions =
    instructions?.map((item) => (typeof item === 'function' ? item({ setPulseResetButton }) : item)) ?? [];
  if (!doNotMentionResetButton) {
    howToInstructions.push(
      <div key='reset'>
        You can reset this scenario using the <RestartHint setPulseResetButton={setPulseResetButton} /> button on the
        top right.
      </div>,
    );
  }

  return (
    <>
      {embed && shouldDisplayResetButton && (
        <Tooltip title='Click Restart to remove all information obtained from this browser. This will reenable some scenarios for you if you were locked out of a specific action.'>
          <div
            className={classNames([
              styles.floatyResetButton,
              isLoading && styles.loading,
              pulseResetButton && styles.pulse,
            ])}
            onClick={() => !isLoading && mutate()}
            data-testid={TEST_IDS.reset.resetButton}
          >
            <div className={styles.resetTitle}>Restart</div>
            <Image src={RestartIcon} alt='Reset scenario' />
          </div>
        </Tooltip>
      )}
      <Container size='large'>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.description}>{description}</div>
        <div className={styles.externalLinks}>
          {!hideSrcListItem && (
            <a href='https://github.com/fingerprintjs/fingerprintjs-pro-use-cases' target='_blank' rel='noreferrer'>
              See on GitHub
              <Image src={ExternalLinkIcon} alt='' />
            </a>
          )}
          {articleUrl && (
            <a href={articleUrl} target='_blank' rel='noreferrer'>
              See technical tutorial
              <Image src={ExternalLinkIcon} alt='' />
            </a>
          )}
        </div>
        {instructions && instructions.length > 0 && (
          <div className={styles.howToUse} id={INSTRUCTION_ANCHOR_ID}>
            <div>
              <h2>How to use this demo</h2>
              <FancyNumberedList items={howToInstructions} />
              {(instructionsNote || useCase.instructionsNote) && (
                <div className={styles.note}>
                  <div>NOTE</div>
                  <div>{instructionsNote ?? useCase.instructionsNote}</div>
                </div>
              )}
            </div>
            <div>
              {moreResourcesPresent && (
                <Button
                  onClick={() => learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  size='large'
                  outlined
                  openNewTab
                  className={styles.resourcesButton}
                >
                  <Image src={Lightbulb} alt='Lightbulb' />
                  See related resources
                </Button>
              )}
            </div>
          </div>
        )}
      </Container>
      <div className={styles.contentWrapper}>
        <div className={styles.backgroundRectangle} />
        <Container size='large' className={styles.content}>
          <div className={styles.browserBar}>
            <div />
            <div />
            <div />
          </div>
          <div className={classNames(styles.browserContent, noInnerPadding && styles.noPadding)}>{children}</div>
        </Container>
      </div>

      {moreResourcesPresent ? (
        <>
          <Container size='large' className={styles.learnMore}>
            <h3 className={styles.learnMoreTitle} ref={learnMoreRef}>
              Learn more
            </h3>
          </Container>
          <ResourceLinks resources={moreResources} />
        </>
      ) : (
        <div className={styles.learnMorePlaceholder}></div>
      )}
    </>
  );
};
