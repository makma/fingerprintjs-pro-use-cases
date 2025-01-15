/**
 * Mock articles "database". In the real world, these articles could be fetched from anywhere.
 * */
import ArticleHeroSvg from './images/articleHero.svg';
import GenericAvatarImage from './images/genericAvatar.png';

export type ArticleData = {
  id: string;
  date: string;
  title: string;
  author: {
    name: string;
    avatar: any;
  };
  description: string;
  content: string[];
  image: any;
  tags: string[];
};

export const ARTICLES: ArticleData[] = [
  {
    id: '1',
    date: '1 hour ago',
    title: 'How to defend your site from common cyber attacks',
    description:
      "Websites are an integral part of our lives, but that also makes them a prime target for cyber attacks — malicious attempts to exploit vulnerabilities in your website's security to steal sensitive information.",
    content: [
      "Websites are an integral part of our lives, but that also makes them a prime target for cyber attacks — malicious attempts to exploit vulnerabilities in your website's security to steal sensitive information, disrupt services, or cause other types of damage.",
      'Depending on the nature of your website and services, successful cyber attacks can have severe consequences such as financial loss, reputation damage, and legal liabilities.',
      /* cspell:disable-next-line */
      "According to cybersecurity statistics compiled by Zippia, the cost of cyber crime is increasing significantly and is expected to grow by as much as 15% over the next five years. It's estimated that by 2025, cyber crime will cost the world roughly $10.5 trillion every year. Zippia estimates that 30,000 websites are hacked each day globally, with one happening every 39 seconds.",
      'The good news is that 95% of cyber attacks are due to human error, which means that something can be done to prevent them. To help track and prevent common cyber attacks, the Open Web Application Security Project (OWASP), a nonprofit organization, maintains a list of the most prevalent security risks affecting websites, including injection attacks, security misconfigurations, and broken authentication. The project is a community-driven initiative that aims to improve the security of software and web applications.',
      'By understanding these attacks and implementing appropriate security measures, you can better protect your websites from potential threats. In this article, you will learn about some of the common cyber attacks and how to implement defenses to ensure that your site is secure.',
    ],
    image: ArticleHeroSvg,
    // cspell:disable-next-line
    author: { name: 'Daniel Olaogun', avatar: GenericAvatarImage },
    tags: ['Fingerprinting', 'Fraud'],
  },
  {
    id: '2',
    date: '2 days ago',
    title: 'How to avoid online auction fraud',
    description:
      "Online auction fraud is a risk for buyers and sellers, and it's one of the easiest scams to set up. Most people know they can buy anything on sites like eBay and Webstore.",
    content: [
      "Online auction fraud is a risk for buyers and sellers, and it's one of the easiest scams to set up. Most people know they can buy anything on sites like eBay and Webstore, but they may not be aware of the signs of a scam auction. Scammers take advantage of this lack of knowledge, making online auction fraud a common avenue for criminals.",
      'Online auction fraud is so prevalent that governments have a list of common warning signs, but millions of people are still at risk. Site owners must also take precautions to protect buyers and sellers, but detecting fake auctions is a team effort that requires everyone involved to be vigilant.',
      'Online auction fraud is a type of online fraud where scammers attempt to steal money and goods from unsuspecting victims by creating fake accounts on online auction websites and bidding on items they never intend to pay for. Scammers often use stolen credit cards or fraudulent payment methods to “win” auctions, leaving the seller with no recourse when the items are not delivered or paid for.',
      'Victims of this type of fraud may also be targeted through phishing scams, where they are asked to send payment before delivery or provide confidential information like bank account numbers.',
    ],
    image: ArticleHeroSvg,
    author: { name: 'Jennifer Marsh', avatar: GenericAvatarImage },
    tags: ['Fingerprinting', 'Fraud'],
  },
  {
    id: '3',
    date: '1 week ago',
    title: 'Friendly Fraud: What It Is & How to Protect Your Business',
    description:
      'Friendly fraud may not sound all that threatening, but it accounts for 70% of all credit card fraud and costs the eCommerce industry billions annually.',
    content: [
      'Friendly fraud may not sound all that threatening, but it accounts for 70% of all credit card fraud and costs the eCommerce industry billions annually.',
      'You’re doing your best to serve and relate to your customers on a human, friendly level. You’re constantly trying to make them happy, anticipate their needs, and improve their lives. You’re doing your best to provide the best customer experience, but not every customer is acting with the best intentions.',
      'Friendly fraud occurs when a customer makes a purchase online for a product or service, then turns around and contacts their card issuer to dispute the charge resulting in a chargeback.',
      'It may sound relatively innocent – and in some cases, it is – but without the proper safeguards, this sort of virtual shoplifting can make a significant dent in your revenue. Let’s learn more about friendly fraud, how common it is, and how to protect your eCommerce business against friendly fraud and chargeback abuse.',
    ],
    image: ArticleHeroSvg,
    author: { name: 'Emma Roberts', avatar: GenericAvatarImage },
    tags: ['Fingerprinting', 'Fraud'],
  },
  {
    id: '4',
    date: '1 month ago',
    title: 'The Basics of Loan Fraud and How To Prevent It',
    description:
      'The balance between consumer convenience and security is a delicate process, especially in a competitive, high-value market.',
    content: [
      'The balance between consumer convenience and security is a delicate process, especially in a competitive, high-value market. For example, when banks and credit card companies provide online loan applications, they make it convenient for potential customers to get a loan. Still, they also make it convenient for identity thieves and hackers.',
      'In 2021, the National Mortgage Application Fraud Risk Index increased by 15% between the 2021 first quarter and the first quarter of 2022. Credit card fraud also skyrocketed by the last quarter of 2021. Fraud affects everyone, from consumers to the banks that approve applications. The amount of money lost may vary, but it raises costs to consumers and leads to hefty monetary losses for financial institutions. The biggest channel for fraudsters is the mobile market as more financial institutions continue to provide services using apps.',
      'There are several different types of loan fraud. One of the most common forms of loan fraud is application fraud, which involves falsely applying for a loan by providing inaccurate or incomplete information on an application form. This could include providing false employment history or exaggerating your income level in order to obtain a larger loan.',
      "The start of loan fraud begins with the consumer. The many ways attackers can obtain personal information depend on their vectors. Some attackers use phishing emails and malicious websites. Others use a variety of ways to install malware on a targeted user's local device, and some local thieves steal unshredded paperwork from garbage cans to collect private information.",
    ],
    image: ArticleHeroSvg,
    author: { name: 'Sarah Thompson', avatar: GenericAvatarImage },
    tags: ['Fingerprinting', 'Fraud'],
  },
  {
    id: '5',
    date: '1 month ago',
    title: 'Why Social Engineering Attacks Are Successful with Technical Staff',
    description:
      'Many organizations focus on data protection from outside attacks but fail to realize that many threats happen from within.',
    content: [
      "Many organizations focus on data protection from outside attacks but fail to realize that many threats happen from within. Insider threats can be malicious or innocent mistakes; however, social engineering is a common factor among both types. You'd expect untrained employees unfamiliar with cyber-attacks to fall victim to social engineering.",
      "Still, the technical staff (e.g., engineers, security people) are also a target and occasionally fall victim to it. Social engineering is effective because companies rely entirely on their employees' ability to detect it. Even the most cyber-savvy individuals can have a mishap, usually from being busy, stressed, tired, or simply forgetting to take a minute to ask questions.",
      "In September 2022, Uber's private network was breached by a teenage attacker who used social engineering methods to gain secure information from an engineer. It started with a simple text message asking an engineer to divulge their credentials. The teenager posed as a people operations employee supporting Uber's infrastructure. After tricking the engineer into sending their credentials, the teenage attacker added their device to the two-factor authentication (2FA) system. Most 2FA systems that use push notifications require validation before adding a new device to a user's account. The teenage attacker spammed notifications to the engineer and then sent a social engineering message telling the engineer to accept them to get the messages to stop. The engineer obliged, allowing the attacker to access Uber's private network.",
      "The attacker scanned the network for sensitive information and found PowerShell scripts with hardcoded administrator credentials. From there, the attacker had access to various data-driven storage that held Uber's intellectual property. This recent story is just one example of how social engineering can successfully trick tech-savvy individuals.",
    ],
    image: ArticleHeroSvg,
    author: { name: 'Jennifer Marsh', avatar: GenericAvatarImage },
    tags: ['Fingerprinting', 'Fraud'],
  },
];
