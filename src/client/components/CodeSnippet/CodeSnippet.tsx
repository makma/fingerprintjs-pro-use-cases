import { CSSProperties, PropsWithChildren } from 'react';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import lightTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/coy';
import styles from './CodeSnippet.module.scss';
import classnames from 'classnames';
import { MyScrollArea } from '../ScrollArea/ScrollArea';
import { MyCopyButton } from '../CopyButton/CopyButton';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { CopyButtonSvg } from '../../img/CopyButtonSvg';
import { CheckMarkSvg } from '../../img/CheckmarkSvg';

export interface CodeSnippetProps {
  language: string;
  children: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
  className?: string;
  dataTestId?: string;
  collapsibleJSON?: boolean;
}

const PRISM_LINE_NUMBER_STYLE = { minWidth: 28 };
const PRISM_CODE_TAG_PROPS = { style: { color: '#c92c2c', font: 'inherit' as const } };

/**
 * Provides a syntax-highlighted code block
 */
export function CodeSnippet({
  language,
  showLineNumbers,
  className,
  children,
  dataTestId,
}: PropsWithChildren<CodeSnippetProps>) {
  const PRISM_CUSTOM_STYLE: CSSProperties = {
    padding: '16px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '16px',
    overflow: 'auto',
    marginTop: '0',
    marginBottom: '0',
    marginLeft: '0',
    marginRight: '0',
  };

  return (
    <div className={styles.snippetContainer}>
      <div className={styles.copyButtonContainer}>
        <MyCopyButton contentToCopy={children} className={styles.copyButton} />
      </div>
      <MyScrollArea className={styles.scrollArea}>
        <PrismAsyncLight
          showLineNumbers={showLineNumbers}
          lineNumberStyle={PRISM_LINE_NUMBER_STYLE}
          wrapLines
          language={language}
          style={lightTheme}
          /** Must use this to override the default style, CSS alone does not work */
          customStyle={PRISM_CUSTOM_STYLE}
          codeTagProps={PRISM_CODE_TAG_PROPS}
          className={classnames(styles.snippet, className)}
          data-testid={dataTestId}
        >
          {children}
        </PrismAsyncLight>
      </MyScrollArea>
    </div>
  );
}

export interface JsonViewerProps {
  json: Record<any, any>;
  className?: string;
  dataTestId?: string;
}

/**
 * Provides a syntax-highlighted JSON viewer with collapsible and copy-pastable properties
 */
export function CollapsibleJsonViewer({ json, className, dataTestId }: JsonViewerProps) {
  return (
    <div className={classnames(styles.snippetContainer, className)}>
      <div className={styles.copyButtonContainer}>
        <MyCopyButton contentToCopy={JSON.stringify(json, null, 2)} className={styles.copyButton} />
      </div>
      <MyScrollArea className={styles.scrollArea}>
        <div className={styles.reactJsonViewerWrapper} data-testid={dataTestId}>
          <JsonView
            src={json}
            collapseStringMode='word'
            // Collapse object after 4 nesting levels
            collapsed={4}
            customizeCopy={(node) => (typeof node === 'object' ? JSON.stringify(node, null, 2) : node)}
            CopyComponent={({ onClick, className }) => (
              <CopyButtonSvg onClick={onClick} className={classnames(className, styles.jsonViewerIcon)} />
            )}
            // cspell:disable-next-line
            CopidComponent={({ className }) => (
              <CheckMarkSvg className={classnames(className, styles.jsonViewerIcon)} />
            )}
          />
        </div>
      </MyScrollArea>
    </div>
  );
}
