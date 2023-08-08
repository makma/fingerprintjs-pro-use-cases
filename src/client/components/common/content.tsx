export type UseCase = {
  title: string;
  url: string;
  intro?: React.ReactNode;
  articleUrl: string;
  instructions: readonly React.ReactNode[];
  moreResources?: readonly {
    type: 'Use case tutorial' | 'Case study' | 'Industry' | 'Article';
    title: string;
    url: string;
  }[];
};

export const USE_CASES = {
  couponFraud: {
    title: 'Coupon Fraud',
    url: '/coupon-fraud',
    intro:
      'Use the demo below to see how Fingerprint can help identify fraudsters who repeatedly use the same coupon under different scenarios to gain unauthorized benefits.',
    articleUrl: 'https://fingerprint.com/use-cases/coupon-promo-abuse/',
    instructions: [
      <>
        Use the sample coupon code <code>Promo3000</code> and click Apply.
      </>,
      <>Try using the same coupon code again.</>,
      <>
        Now try to use another sample code <code>BlackFriday</code> for the same item.
      </>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Coupon Promo Abuse',
        url: 'https://fingerprint.com/use-cases/coupon-promo-abuse/',
      },
      {
        type: 'Case study',
        title: 'Promo Abuse',
        url: 'https://fingerprint.com/case-studies/promo-abuse/',
      },
      {
        type: 'Industry',
        title: 'E-commerce',
        url: 'https://fingerprint.com/ecommerce/',
      },
    ],
  },
  credentialStuffing: {
    title: 'Credential Stuffing',
    url: '/credential-stuffing',
    articleUrl: 'https://fingerprint.com/use-cases/credential-stuffing/',
    instructions: [
      <>
        Put in the username <code>user</code> and password <code>password</code>.
      </>,
      <>
        Click <b>Log in</b>. You won't be able to log in despite having the correct credentials.
      </>,
      <>Try calling the login endpoint directly or using JavaScript to spoof the request ID and visitor ID.</>,
      <>Try to login with different passwords. You will be blocked after 5 attempts.</>,
      <>Try using incognito mode to log into this page.</>,
    ],
    intro: (
      <>
        <p>
          Use the this demo below to see how Fingerprint protects your login page from account takeover even if your
          credentials are stolen.
        </p>
        <p>
          In this demo, the login attempts from an unknown device are challenged even if the attacker knows the correct
          credentials and repeated attempts to log in from the same browser are blocked.
        </p>
      </>
    ),
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Credential Stuffing',
        url: 'https://fingerprint.com/use-cases/credential-stuffing/',
      },
    ],
  },
  loanRisk: {
    title: 'Loan Risk',
    url: '/loan-risk',
    intro:
      'Use this demo to see how Fingerprint allows you to collect high-quality, low-risk loan applications from your anonymous visitors. Prevent fraudsters and rejected applicants from submitting multiple inconsistent applications.',
    instructions: [
      <>Pick some values in the form and submit your loan application.</>,
      <>
        Change some of the provided information and apply for a loan again. You will be warned about the application
        inconsistencies and your loan won't be calculated.
      </>,
      <>Try bypassing the protection by switching to incognito mode or deleting your cookies.</>,
    ],
    moreResources: [
      // {
      //   type: 'Use case tutorial',
      //   title: 'Loan Risk',
      //   url: 'https://fingerprint.com/use-cases/loan-risk/',
      // }
      {
        url: 'https://fingerprint.com/blog/what-is-loan-fraud/',
        type: 'Article',
        title: 'What is Loan Fraud?',
      },
    ],
  },
  paymentFraud: {
    title: 'Payment Fraud',
    url: '/payment-fraud',
    articleUrl: 'https://fingerprint.com/use-cases/payment-fraud/',
    intro:
      'Use the demo to see how Fingerprint can protect your transactions from card cracking attempts, stolen credit cards, and reduce chargebacks.',
    instructions: [
      <>Change the pre-filled card details to simulate testing stolen credit cards.</>,
      <>Try placing an order multiple times. You will be stopped after 3 attempts.</>,
      <>
        Click the <b>Restart</b> button to reset the demo.
      </>,
      <>Use the correct pre-filled card details but select "Ask for chargeback" and place your order.</>,
      <>Try placing an order again. You won't be able to do it with your chargeback history.</>,
      <>
        Click the <b>Restart</b> button to reset the demo.
      </>,
      <>
        Select "Flag this as stolen credit card after purchase" to simulate using a stolen card and place your order.
      </>,
      <>Try placing an order again. You won't be able to with your history of stealing credit cards.</>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Payment Fraud',
        url: 'https://fingerprint.com/use-cases/payment-fraud/',
      },
      {
        url: 'https://fingerprint.com/blog/omnichannel-fraud/',
        type: 'Article',
        title: 'Omnichannel Fraud',
      },
    ],
  },
  paywall: {
    title: 'Paywall',
    url: '/paywall',
    moreResources: [
      // {
      //   type: 'Use case tutorial',
      //   title: 'Paywall',
      //   url: 'https://fingerprint.com/use-cases/paywall/',
      // },
    ],
  },
  personalization: {
    title: 'Personalization',
    url: '/personalization',
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Personalization',
        url: 'https://fingerprint.com/use-cases/personalization/',
      },
    ],
  },
  webScraping: {
    title: 'Web Scraping Prevention',
    url: '/web-scraping',
    moreResources: [
      {
        url: 'https://fingerprint.com/use-cases/web-scraping-prevention/',
        type: 'Use case tutorial',
        title: 'Web Scraping Prevention',
      },
      {
        url: 'https://fingerprint.com/blog/betting-bots/',
        type: 'Article',
        title: 'Betting Bots',
      },
    ],
  },
} as const satisfies Record<string, UseCase>;

export const USE_CASES_ARRAY = Object.values(USE_CASES);

export const PLATFORM_MENU_ITEMS = [{ title: 'Playground', url: '/playground' }];

export const URL = {
  mainSite: 'https://fingerprint.com',
  githubRepoUrl: 'https://github.com/fingerprintjs/fingerprintjs/',
  githubApiUrl: 'https://api.github.com/repos/fingerprintjs',
  githubCommunityRepoUrl: 'https://github.com/fingerprintjs/home',
  botDRepoUrl: 'https://github.com/fingerprintjs/BotD',
  botDIntegrationsRepoUrl: 'https://github.com/fingerprintjs/botd-integrations',
  dashboardLoginUrl: 'https://dashboard.fingerprint.com/login',
  careersUrl: 'https://boards.greenhouse.io/fingerprintjs/',
  careersConsoleLogUrl: 'https://grnh.se/bb9c55804us',
  linkedinUrl: 'https://www.linkedin.com/company/fingerprintjs/',
  twitterUrl: 'https://twitter.com/FingerprintJs/',
  signupUrl: 'https://dashboard.fingerprint.com/signup',
  statusUrl: 'https://status.fingerprint.com',
  supportMail: 'support@fingerprint.com',
  salesMail: 'sales@fingerprint.com',
  worKMail: 'work@fingerprint.com',
  pressMail: 'press@fingerprint.com',
  discordServerURL: 'https://discord.gg/ad6R2ttHVX',
  docsUrl: 'https://dev.fingerprint.com',
  promotionalVideo: 'https://www.youtube.com/embed/UEYBysyPTBs',
  demoVideo: 'https://www.youtube.com/embed/hVktdWfyBuU',
  g2ReviewUrl: 'https://www.g2.com/products/fingerprintjs-fingerprint/reviews',
} as const;
