import { FunctionComponent } from 'react';
import { ResourceLink } from '../../content';
import styles from './ResourceLinks.module.scss';
import Container from '../Container';

export const ResourceLinks: FunctionComponent<{ resources: ResourceLink[] }> = ({ resources }) => {
  return (
    <Container size='large' className={styles.container}>
      <div className={styles.cardCollection}>
        {resources.map((resource, index) => (
          <a key={index} href={resource.url} target='_blank' rel='noreferrer' className={styles.card}>
            <div className={styles.type}>{resource.type}</div>
            <div className={styles.title}>{resource.title}</div>
            {resource.description ? <div className={styles.description}>{resource.description}</div> : null}
          </a>
        ))}
      </div>
    </Container>
  );
};
