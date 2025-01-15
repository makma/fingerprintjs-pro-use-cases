import React, { useState, useRef, PropsWithChildren } from 'react';
import classNames from 'classnames';
import ExpandMoreSvg from '../../img/expand-more.svg';
import styles from './DropdownMenu.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import Image from 'next/image';
import Dropdown, { DropdownProps } from '../Dropdown/Dropdown';
import Link from 'next/link';

export interface DropdownMenuProps {
  name: string;
  children?: React.ReactNode;
  className?: string;
  darkMode?: boolean;
  dropdownProps: DropdownProps;
  onLinkClick?: () => void;
}

export function DropdownMenu({ name, className, darkMode, dropdownProps, onLinkClick }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div className={classNames(className, { [styles.darkDropdown]: darkMode })} ref={ref}>
      <span tabIndex={0} onClick={() => setIsOpen(!isOpen)} className={styles.link}>
        {name}
        <Image
          src={ExpandMoreSvg}
          className={classNames(styles.icon, {
            [styles.iconIsOpen]: isOpen,
            [styles.iconHover]: typeof isOpen === 'undefined',
          })}
          alt={'expand more'}
        />
      </span>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{
              opacity: 0,
              translateY: -15,
            }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -15, transition: { duration: 0.15 } }}
          >
            <Dropdown
              {...dropdownProps}
              closeDropdown={() => {
                setIsOpen(false);
                onLinkClick?.();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type DropdownLikeLinkProps = PropsWithChildren<{ href: string; className?: string; onLinkClick?: () => void }>;

export function DropdownLikeLink({ href, children, className, onLinkClick }: DropdownLikeLinkProps) {
  return (
    <Link href={href} className={classNames(className, styles.link)} onClick={onLinkClick}>
      {children}
    </Link>
  );
}
