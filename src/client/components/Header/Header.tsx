'use client';

import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import MobileNavbar from '../MobileNavbar/MobileNavbar';
import Container from '../Container';
import HeaderBar from '../HeaderBar/HeaderBar';
import classNames from 'classnames';
import { PLAYGROUND_METADATA, URL, USE_CASES_NAVIGATION } from '../../content';
import { DropdownLikeLink, DropdownMenu } from '../DropdownMenu/DropdownMenu';
import Image from 'next/image';
import LogoSvg from './fpjs.svg';
import Restart from '../../img/restart.svg';

import styles from './Header.module.scss';
import Link from 'next/link';
import Button from '../Button/Button';
import { useReset } from '../../hooks/useReset/useReset';
import { Tooltip } from '@mui/material';
import { TEST_IDS } from '../../testIDs';

interface HeaderProps {
  notificationBar?: {
    arrowText?: string;
    barBody?: string;
    url?: string;
    backgroundColor?: string;
  };
}
export default function Header({ notificationBar }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mobileBodyClass = 'isMobileMenuOpen';
    if (isMobileMenuOpen) {
      document.body.classList.add(mobileBodyClass);
    } else {
      document.body.classList.remove(mobileBodyClass);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const { mutate, shouldDisplayResetButton, isLoading: isResetLoading } = useReset({});

  return (
    <>
      {notificationBar && !isMobileMenuOpen && (
        <HeaderBar
          linkUrl={notificationBar.url}
          arrowText={notificationBar.arrowText}
          backgroundColor={notificationBar.backgroundColor}
        >
          {<div dangerouslySetInnerHTML={{ __html: notificationBar.barBody ?? '' }} />}
        </HeaderBar>
      )}
      <header className={classNames(styles.header)}>
        <div className={styles.nav}>
          <Container size='large' className={styles.root}>
            <nav className={styles.navMain}>
              <div className={styles.navLeft}>
                <Link href='https://fingerprint.com' className={styles.link} title='Logo'>
                  <Image src={LogoSvg} className={styles.logo} alt='Fingerprint logo' />
                </Link>
                <DropdownLikeLink href='/' className={styles.desktopOnly}>
                  Home
                </DropdownLikeLink>
                <DropdownLikeLink href={PLAYGROUND_METADATA.url} className={styles.desktopOnly}>
                  Playground
                </DropdownLikeLink>
                <DropdownMenu
                  name='Use cases'
                  className={styles.desktopOnly}
                  dropdownProps={{
                    leftColumns: [
                      {
                        list: USE_CASES_NAVIGATION.slice(0, 6),
                        cardBackground: true,
                      },
                      {
                        list: USE_CASES_NAVIGATION.slice(6),
                        cardBackground: true,
                      },
                    ],
                  }}
                />
              </div>
              <div className={styles.navRight}>
                {shouldDisplayResetButton && (
                  <Tooltip
                    title={
                      'Click Restart to remove all information obtained from this browser. This will reenable some scenarios for you if you were locked out of a specific action.'
                    }
                    enterTouchDelay={400}
                  >
                    <button
                      className={classNames(styles.desktopOnly, styles.resetButton, isResetLoading && styles.loading)}
                      onClick={() => mutate()}
                      disabled={isResetLoading}
                      id='click_top_nav_restart'
                      data-testid={TEST_IDS.reset.resetButton}
                    >
                      Restart
                      <Image src={Restart} alt='Restart button' />
                    </button>
                  </Tooltip>
                )}
                <Button
                  href={URL.contactSales}
                  size='medium'
                  outlined
                  openNewTab
                  className={styles.button}
                  buttonId='click_top_nav_contact_sales'
                >
                  Contact sales
                </Button>
                <Button
                  variant='primary'
                  size='medium'
                  className={styles.signupButton}
                  href={URL.signupUrl}
                  openNewTab
                  buttonId='click_top_nav_get_started'
                >
                  Get started
                </Button>
                <button
                  aria-label='Mobile Menu'
                  className={classNames(styles.mobileToggler, { [styles.isOpen]: isMobileMenuOpen })}
                  onClick={handleToggleMobileMenu}
                >
                  {/* hamburger button */}
                  <span />
                  <span />
                  <span />
                  <span />
                </button>
              </div>
            </nav>
          </Container>
          {isMobileMenuOpen && <MobileNavbar closeMobileMenu={() => setIsMobileMenuOpen(false)} />}
        </div>
      </header>
    </>
  );
}
