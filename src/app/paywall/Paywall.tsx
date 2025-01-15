'use client';

import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import { USE_CASES } from '../../client/content';
import { ArticleCard, ArticleGrid } from './components/ArticleGrid';
import { ARTICLES } from './api/articles';

/**
 * Main Paywall use case page with article listing
 */
export default function Paywall({ embed }: { embed: boolean }) {
  const heroArticle = ARTICLES[0];
  const gridArticles = ARTICLES.slice(1);
  return (
    <UseCaseWrapper useCase={USE_CASES.paywall}>
      <ArticleCard article={heroArticle} isHeroArticle embed={embed} />
      <ArticleGrid articles={gridArticles} embed={embed} />
    </UseCaseWrapper>
  );
}
