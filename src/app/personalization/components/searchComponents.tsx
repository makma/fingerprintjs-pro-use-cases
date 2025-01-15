import { FunctionComponent } from 'react';
import Image from 'next/image';
import SearchIcon from '../img/search.svg';
import styles from './searchComponents.module.scss';
import { TEST_IDS } from '../../../client/testIDs';

type SearchProps = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};
export const Search: FunctionComponent<SearchProps> = ({ search, setSearch }) => {
  return (
    <div>
      <div className={styles.searchBox}>
        <Image src={SearchIcon} alt='Search' className={styles.searchIcon} />
        <input
          type='text'
          className={styles.searchInput}
          placeholder='Search for your favorite coffee'
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          data-testid={TEST_IDS.personalization.search}
        />
      </div>
    </div>
  );
};

const SEARCH_HISTORY_DISPLAY_LIMIT = 6;

type SearchHistoryProps = {
  searchHistory?: string[];
  setSearchHistory: (searchTerm: string) => void;
};

export const SearchHistory: FunctionComponent<SearchHistoryProps> = ({ searchHistory, setSearchHistory }) => {
  if (!searchHistory || searchHistory.length === 0) {
    return null;
  }

  return (
    <div>
      <div className={styles.searchHistory}>
        Last searches:{' '}
        {searchHistory.slice(0, SEARCH_HISTORY_DISPLAY_LIMIT).map((searchTerm, index) => (
          <>
            <span
              key={index}
              onClick={() => setSearchHistory(searchTerm)}
              className={styles.searchTerm}
              data-testid={TEST_IDS.personalization.searchHistoryItem}
            >
              {searchTerm}
            </span>
            ,{' '}
          </>
        ))}
      </div>
    </div>
  );
};
