// Target customer configuration for Sales MCP

export const TARGET_PLATFORMS = {
  'no-code': {
    keywords: ['no-code', 'low-code', 'visual', 'drag-and-drop', 'builder', 'app builder'],
    examples: ['bubble', 'webflow', 'airtable', 'notion', 'retool'],
    score_weight: 30,
    pain_points: [
      'user project abandonment',
      'complex business logic decisions', 
      'user success and onboarding',
      'feature adoption and engagement'
    ]
  },
  'crm': {
    keywords: ['crm', 'customer relationship', 'sales management', 'lead management'],
    examples: ['pipedrive', 'hubspot', 'salesforce', 'zoho'],
    score_weight: 25,
    pain_points: [
      'sales strategy guidance',
      'deal qualification and scoring',
      'customer success management',
      'pipeline optimization'
    ]
  },
  'project-management': {
    keywords: ['project management', 'task management', 'workflow', 'collaboration'],
    examples: ['asana', 'monday.com', 'clickup', 'basecamp'],
    score_weight: 20,
    pain_points: [
      'project planning and strategy',
      'resource allocation decisions',
      'team productivity optimization',
      'project success prediction'
    ]
  },
  'e-commerce': {
    keywords: ['e-commerce', 'online store', 'marketplace', 'shopping cart'],
    examples: ['shopify', 'woocommerce', 'bigcommerce', 'magento'],
    score_weight: 20,
    pain_points: [
      'product strategy and positioning',
      'marketing and conversion optimization',
      'inventory and pricing decisions',
      'customer acquisition strategy'
    ]
  },
  'automation': {
    keywords: ['automation', 'workflow automation', 'integration', 'zapier'],
    examples: ['zapier', 'make.com', 'integromat', 'automate.io'],
    score_weight: 15,
    pain_points: [
      'business process optimization',
      'workflow design and strategy',
      'automation ROI and prioritization',
      'integration strategy planning'
    ]
  }
};

export const COMPANY_SIZE_CRITERIA = {
  revenue: {
    ideal: { min: 10_000_000, max: 50_000_000 }, // $10M-$50M
    acceptable: { min: 5_000_000, max: 100_000_000 }, // $5M-$100M
    minimum: { min: 1_000_000 } // $1M+
  },
  employees: {
    ideal: { min: 50, max: 500 },
    acceptable: { min: 25, max: 1000 },
    minimum: { min: 10 }
  },
  funding_stage: {
    ideal: ['Series A', 'Series B', 'Series C'],
    acceptable: ['Seed', 'Series A', 'Series B', 'Series C', 'Series D'],
    avoid: ['Pre-seed', 'IPO', 'Acquired']
  }
};

export const QUALIFICATION_SCORING = {
  platform_type: {
    max_points: 30,
    weights: {
      'no-code': 30,
      'crm': 25, 
      'project-management': 20,
      'e-commerce': 20,
      'automation': 15,
      'other': 5
    }
  },
  company_size: {
    max_points: 25,
    revenue_scoring: {
      '10M-50M': 25,
      '5M-10M': 20,
      '1M-5M': 15,
      '500K-1M': 10,
      'unknown_but_indicators': 12
    },
    employee_scoring: {
      '50-500': 25,
      '25-50': 20,
      '10-25': 15,
      '500+': 15,
      'unknown': 5
    }
  },
  growth_indicators: {
    max_points: 20,
    factors: {
      'recent_funding': 20,
      'active_hiring': 15,
      'product_launches': 12,
      'press_coverage': 10,
      'user_growth_signals': 8,
      'stable_mature': 5
    }
  },
  technical_fit: {
    max_points: 15,
    factors: {
      'api_first_platform': 15,
      'integration_ecosystem': 12,
      'developer_focused': 10,
      'technical_team': 8,
      'simple_tools': 5
    }
  },
  contact_quality: {
    max_points: 10,
    weights: {
      'ceo': 10,
      'founder': 10,
      'cto': 8,
      'cpo': 8,
      'vp_product': 6,
      'vp_engineering': 6,
      'director': 4,
      'manager': 3,
      'unknown': 1
    }
  }
};

export const QUALIFICATION_TIERS = {
  hot: { min_score: 80, priority: 1, action: 'immediate_outreach' },
  warm: { min_score: 60, priority: 2, action: 'research_more' },
  cold: { min_score: 40, priority: 3, action: 'nurture_campaign' },
  not_qualified: { min_score: 0, priority: 4, action: 'skip' }
};

export const EMAIL_TEMPLATES = {
  no_code: {
    pain_point: 'user project abandonment and strategic decision-making',
    value_prop: 'AI-powered strategic guidance embedded in your platform',
    metrics: '40% reduction in project abandonment, 60% faster user success',
    competitors: 'Bubble, Webflow, Retool'
  },
  crm: {
    pain_point: 'sales strategy and deal qualification challenges',
    value_prop: 'intelligent sales strategy coaching in your CRM workflows',
    metrics: '35% improvement in deal win rates, 50% faster user productivity',
    competitors: 'HubSpot, Pipedrive, Salesforce'
  },
  project_management: {
    pain_point: 'project planning and resource allocation decisions',
    value_prop: 'strategic project guidance and success prediction',
    metrics: '30% improvement in project success rates, 45% better resource utilization',
    competitors: 'Asana, Monday.com, ClickUp'
  },
  e_commerce: {
    pain_point: 'product strategy and conversion optimization',
    value_prop: 'AI business strategy coaching for e-commerce success',
    metrics: '25% increase in merchant success rates, 40% better product decisions',
    competitors: 'Shopify, WooCommerce, BigCommerce'
  },
  automation: {
    pain_point: 'workflow design and automation ROI optimization',
    value_prop: 'strategic automation guidance and process optimization',
    metrics: '50% better automation ROI, 35% faster workflow implementation',
    competitors: 'Zapier, Make.com, Integromat'
  }
};

export const RESEARCH_SOURCES = {
  free: {
    crunchbase: 'https://www.crunchbase.com/organization/',
    linkedin: 'https://www.linkedin.com/company/',
    producthunt: 'https://www.producthunt.com/',
    github: 'https://github.com/',
    builtwith: 'https://builtwith.com/',
    similarweb: 'https://www.similarweb.com/website/'
  },
  search_patterns: {
    funding: '{company} funding raised series',
    hiring: '{company} jobs hiring careers',
    news: '{company} news press release',
    competitors: '{platform_type} platforms like {company}',
    tech_stack: '{company} technology stack API integration'
  }
}; 