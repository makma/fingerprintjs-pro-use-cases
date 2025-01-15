import { getAndValidateFingerprintResult, Severity } from '../../../../../server/checks';
import { NextResponse } from 'next/server';
import { ArticleData, ARTICLES } from '../../articles';
import { ArticleViewDbModel } from '../../database';
import { Op } from 'sequelize';
import { PAYWALL_COPY } from '../../copy';
import { getTodayDateRange } from '../../../../../utils/timeUtils';

export type ArticleResponse = {
  message: string;
  severity: Severity;
  article?: ArticleData;
  remainingViews?: number;
  viewedArticles?: number;
};

export type ArticleRequestPayload = {
  requestId: string;
};

const ARTICLE_VIEW_LIMIT = 2;

/**
 * Fetches article by its ID. Supports paywall logic, which means that we keep track of how many articles were viewed by a given user.
 * If a user has exceeded limit of articles that he can view for free, we return an error.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<ArticleResponse>> {
  const { requestId } = (await req.json()) as ArticleRequestPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  const articleId = params.id;
  const article = ARTICLES.find((article) => article.id === articleId);
  if (!article) {
    return NextResponse.json({ severity: 'error', message: 'Article not found' }, { status: 404 });
  }

  // Check how many articles were viewed by this visitor ID today
  const oldViewCount = await ArticleViewDbModel.count({
    where: { visitorId, timestamp: { [Op.between]: getTodayDateRange() } },
  });

  // Check if this visitor has already viewed this specific article
  const viewedThisArticleBefore = await ArticleViewDbModel.findOne({
    where: {
      visitorId,
      articleId,
      timestamp: { [Op.between]: getTodayDateRange() },
    },
  });

  // If the visitor is trying to view a new article beyond the daily limit, return an error
  if (oldViewCount >= ARTICLE_VIEW_LIMIT && !viewedThisArticleBefore) {
    return NextResponse.json({ severity: 'error', message: PAYWALL_COPY.limitReached }, { status: 403 });
  }

  // Otherwise, save the article view and return the article
  await saveArticleView(articleId, visitorId);
  const newViewCount = viewedThisArticleBefore ? oldViewCount : oldViewCount + 1;
  const articlesRemaining = ARTICLE_VIEW_LIMIT - newViewCount;
  return NextResponse.json({
    severity: 'warning',
    message: articlesRemaining > 0 ? PAYWALL_COPY.nArticlesRemaining(articlesRemaining) : PAYWALL_COPY.lastArticle,
    article,
    articlesRemaining,
    articlesViewed: newViewCount,
  });
}

/**
 * Saves article view into the database. If it already exists, we update its timestamp.
 */
async function saveArticleView(articleId: string, visitorId: string) {
  const [view, created] = await ArticleViewDbModel.findOrCreate({
    where: { articleId, visitorId, timestamp: { [Op.between]: getTodayDateRange() } },
    defaults: { articleId, visitorId, timestamp: new Date() },
  });

  if (!created) {
    view.timestamp = new Date();
    await view.save();
  }
  return view;
}
