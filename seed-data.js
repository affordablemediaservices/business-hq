/* Starter data: imported automatically in demo mode, or with the
   "Import starter data" button the first time you log in to Supabase. */
window.PORTAL_SEED = {
  projects: [
    {
      key: 'vape', name: 'CheapVapes.club — Vape E-commerce Website', client: 'Pierre — CheapVapes.club (earlier Cloud Discount Co branding)',
      category: 'E-commerce', status: 'Active', priority: 'Urgent', owner_side: 'Shared', needs_confirmation: true,
      links: 'https://cheapvapes.club',
      description: 'PRIORITY #1 — keep CheapVapes.club updated. Existing website, ongoing management: development, products, maintenance, SEO/blog and integrations. NEEDS CONFIRMATION: current live domain and branding.',
      instructions: 'Regulated product: every product, marketing and integration change needs an age-restriction, platform-policy and legal-compliance review before going live. Never assume compliance without verification.',
      plan: [
        { title: 'Website Development', items: ['Website design', 'Frontend and backend development', 'Website functionality', 'Checkout and payment gateway', 'Shipping integration', 'Order notifications', 'Website performance', 'Customer experience', 'Website security'] },
        { title: 'Product Management', items: ['Product imports from wholesalers', 'Product title and description updates', 'Product images', 'Product categories', 'Pricing updates', 'Stock updates', 'Product verification', 'Product page quality checks'] },
        { title: 'Website Maintenance (recurring — Workflow B)', items: ['Regular functionality checks', 'Bug reporting', 'Website updates', 'Security checks', 'Backup monitoring', 'Performance checks', 'Broken link checks'] },
        { title: 'SEO & Content (recurring — Workflow A)', items: ['Keyword research', 'Blog article management', 'Article uploads', 'SEO titles and descriptions', 'Internal linking', 'Google indexing monitoring', 'Website content updates', 'Affiliate section management'] },
        { title: 'Other Tasks', items: ['Business cards', 'QR codes', 'Promotional banners', 'Relevant website integrations', 'Email notifications and Brevo integration'] },
        { title: 'Compliance Checkpoints', items: ['Age verification at entry and checkout confirmed', 'Payment processor permits this product category', 'Shipping method and carrier rules verified', 'Product claims and marketing copy reviewed', 'State/federal licensing and registration status confirmed'] }
      ]
    },
    {
      key: 'feelgood', name: 'Feel Good Compilation — YouTube', client: 'Pierre', category: 'YouTube Channel',
      status: 'Planning', priority: 'Low', owner_side: 'Shared', needs_confirmation: true,
      description: 'Existing channel: singing compilations, ranking videos, entertainment content. Current strategy needs confirmation.',
      instructions: 'HISTORICAL targets, not active until Pierre reconfirms: 2 long-form videos/week, 14 Shorts/week, long-form published Tuesday and Friday at 8 AM Florida time.',
      plan: [
        { title: 'Video Production (Workflows D / E)', items: ['Video research', 'Video ideas', 'Content selection', 'Script preparation', 'Daisy AI voiceover', 'Long-form video editing', 'Shorts editing', 'Video quality checks'] },
        { title: 'Publishing', items: ['Video titles', 'Descriptions', 'Thumbnails', 'Tags and SEO', 'Scheduling', 'Publishing', 'Final URL tracking'] },
        { title: 'Channel Management', items: ['Channel optimization', 'Comments and audience engagement', 'Performance analysis', 'Content planning', 'Monetization planning'] }
      ]
    },
    {
      key: 'aitech', name: 'AI & Technology YouTube Channel', client: 'Pierre', category: 'YouTube Channel',
      status: 'On Hold', priority: 'Low', owner_side: 'Shared', needs_confirmation: true,
      description: 'Previously proposed, paused due to budget. Historical proposed name: Keep Up With The Future. Topics: AI, future technology, Elon Musk, Tesla, SpaceX, robotics, new inventions, future gadgets.',
      instructions: 'Do not activate until Pierre confirms. Keep separate from the New Animated YouTube Channel unless Pierre confirms they are the same channel.',
      plan: [
        { title: 'Planning', items: ['Channel research', 'Competitor analysis', 'Channel naming', 'Branding', 'Logo and banner', 'Daisy AI avatar', 'Daisy voice integration', 'Script writing', 'Visual production', 'Video editing', 'YouTube SEO', 'Publishing', 'Analytics'] }
      ]
    },
    {
      key: 'realestate', name: 'Real Estate Business — Rock Solid Group', client: 'Pierre — Rock Solid Group (South Florida / South Broward)',
      category: 'Real Estate', status: 'Active', priority: 'High', owner_side: 'Shared', needs_confirmation: false,
      start_date: '2026-11-16',
      description: 'PRIORITY #3 — real estate website + lead creation system, blogging and social media. Buyer and Seller Guides approved. Website development requested on 16 Nov 2026.',
      instructions: 'Lead contact details go ONLY in the restricted Leads (CRM) section, never in tasks or documents.',
      plan: [
        { title: 'Real Estate Website (Workflow F)', items: ['Website planning', 'Website design', 'Website development', 'IDX integration research', 'Property listing search', 'Property pages', 'Buyer lead forms', 'Seller lead forms', 'CRM integration', 'Contact forms', 'Mobile responsiveness', 'Website SEO'] },
        { title: 'Lead Creation System', items: ['Buyer lead landing page', 'Seller lead landing page (home valuation)', 'Lead forms send leads into the Leads (CRM) section', 'Facebook ads pointing to the landing pages', 'Automatic follow-up message to new leads', 'Lead source tracking'] },
        { title: 'Blogging', items: ['Blog section on the website', 'Local market and neighborhood articles', 'Blog publishing schedule (Content calendar)', 'Share each article on social media'] },
        { title: 'Buyer & Seller Resources', items: [{ text: 'Buyer Guide (approved)', done: true }, { text: 'Seller Guide (approved)', done: true }, 'Local city information', 'Local maps', 'Real estate market information', 'Resource updates'] },
        { title: 'Marketing', items: ['Facebook Page', 'Facebook Groups', 'Instagram', 'Google Business Profile', 'Local SEO', 'Real estate content', 'Video content', 'Lead generation', 'Advertising planning'] }
      ]
    },
    {
      key: 'restaurant', name: 'Restaurant Website & CRM (Prospect)', client: 'Prospect restaurant — agency client (name to be confirmed)',
      category: 'Agency Client', status: 'Not Started', priority: 'Medium', owner_side: 'Developer', needs_confirmation: true,
      description: 'Potential agency client, pending client decision. Work discussed: website proposal, website demo, CRM dashboard demo, design and functionality planning, potential onboarding.',
      instructions: "Keep separate from Pierre's own businesses. Not a confirmed paying project until the proposal is approved.",
      plan: [
        { title: 'Prospect & Sales', items: ['Prospect information', 'Proposal', 'Demo feedback', 'Client approval', 'Project scope'] },
        { title: 'Website', items: ['Website requirements', 'Website design', 'Website development'] },
        { title: 'CRM', items: ['CRM requirements', 'CRM dashboard'] },
        { title: 'After Launch', items: ['Future maintenance'] }
      ]
    },
    {
      key: 'ams', name: 'Affordable Media Services (AMS)', client: 'Pierre — Affordable Media Services (agency)',
      category: 'Agency', status: 'Active', priority: 'Medium', owner_side: 'Shared', needs_confirmation: false,
      description: "PRIORITY #4 — YouTube + social media for the agency. Pierre's agency. Services: website development, application development, AI automation, custom CRM systems, AI calling agents, lead-generation agents, digital marketing, SEO.",
      plan: [
        { title: 'YouTube & Social Media', items: ['Agency YouTube channel setup', 'YouTube content plan', 'Social media posting schedule', 'Promotional videos'] },
        { title: 'Agency Branding', items: ['Agency positioning', 'Logo', 'Brand guidelines', 'Website content', 'Portfolio', 'Promotional graphics'] },
        { title: 'Agency Website', items: ['Website structure', 'Service pages', 'Portfolio', 'Contact page', 'Lead forms', 'SEO', 'Mobile optimization'] },
        { title: 'Marketing', items: ['Facebook business page (Pierre — client-owned)', 'Social media content', 'Promotional videos', 'Agency marketing', 'Lead-generation planning'] },
        { title: 'Business Operations (Workflow G)', items: ['Business email', 'Client onboarding', 'Proposals', 'Service documentation', 'Internal workflows', 'Client management'] }
      ]
    },
    {
      key: 'animated', name: 'Así se Construyó — Spanish YouTube Channel', client: 'Pierre', category: 'YouTube Channel',
      status: 'Planning', priority: 'High', owner_side: 'Shared', needs_confirmation: true, start_date: '2026-11-17', links: 'https://www.youtube.com/results?search_query=NextGen+Manufacturing',
      description: 'PRIORITY #2 — only if it fits the developer\'s schedule. Faceless Spanish channel about megaprojects and engineering, following the structure of NextGen Manufacturing. Male narrator plus a female AI host on camera (Valentina). Target: 2 videos per week.',
      instructions: 'Name chosen: Así se Construyó (YouTube rejected Así lo Construyeron). Confirm the developer has capacity for 2 videos/week before starting production.',
      plan: [
        { title: 'Spanish Channel Workflow', items: ['1. Reference Research', '2. Competitor Analysis', '3. Channel Strategy', '4. Name Selection', '5. Branding', '6. Channel Setup', '7. Script Development', '8. Animation Production', '9. Editing', '10. Quality Review', '11. Publishing (2 videos/week)', '12. Performance Analysis'] },
        { title: 'Spanish Upload Checklist (per video)', items: ['Video language set to Spanish', 'Title and description language set to Spanish', 'Spanish title, description, tags and chapters', 'Spanish thumbnail text checked'] }
      ]
    }
  ],

  tasks: [
    { project: 'vape', title: 'Weekly check: CheapVapes.club products, prices and stock up to date', category: 'Product Management', type: 'One-off', status: 'To Do', priority: 'Urgent', responsible: 'Developer', instructions: 'Priority #1. Switch on the Product Management and Website Maintenance workflows once the weekday is agreed.' },
    { project: 'animated', title: 'Confirm developer capacity for 2 videos/week', category: 'Channel Management', type: 'Milestone', status: 'To Do', priority: 'High', responsible: 'Developer', instructions: 'Priority #2 only if it fits the schedule. Tell Pierre yes/no and a realistic start date.' },
    { project: 'animated', title: 'Reference research — analyze NextGen Manufacturing', category: 'Research', type: 'One-off', status: 'To Do', priority: 'High', responsible: 'Developer', instructions: 'Stage 1 of the Spanish channel workflow: structure, video length, thumbnails, titles, pacing.' },
    { project: 'realestate', title: 'Plan the lead creation system (landing pages → Leads CRM)', category: 'CRM & Leads', type: 'Milestone', status: 'To Do', priority: 'High', responsible: 'Developer' },
    { project: 'realestate', title: 'Set up blog + social media posting plan', category: 'Marketing', type: 'One-off', status: 'To Do', priority: 'Medium', responsible: 'Developer' },
    { project: 'ams', title: 'Plan AMS YouTube + social media content', category: 'Marketing', type: 'One-off', status: 'To Do', priority: 'Medium', responsible: 'Developer' },
    { project: 'ams', title: 'Create agency Facebook business page', category: 'Marketing', type: 'Client Action', status: 'To Do', priority: 'High', responsible: 'Pierre', notes: 'Pierre said on 17 Nov 2026 he would create the AMS Facebook page.' },
    { project: 'realestate', title: 'Real estate website — confirm requirements', category: 'Website Development', type: 'Milestone', status: 'To Do', priority: 'High', responsible: 'Developer', approval_required: true, approval_status: 'Pending Review', instructions: 'First step of Workflow F. Website development requested 16 Nov 2026.' },
    { project: 'vape', title: 'Confirm current domain and branding (CheapVapes.club vs Cloud Discount Co)', category: 'Business Operations', type: 'Client Action', status: 'Waiting for Client', priority: 'Medium', responsible: 'Pierre' },
    { project: 'vape', title: 'Confirm weekday for weekly blog article publishing', category: 'SEO & Content', type: 'Client Action', status: 'Waiting for Client', priority: 'Medium', responsible: 'Pierre', instructions: 'Needed before the weekly blog workflow (A) is switched on.' },
    { project: 'feelgood', title: 'Reconfirm Feel Good Compilation strategy and publishing targets', category: 'Channel Management', type: 'Client Action', status: 'Waiting for Client', priority: 'Medium', responsible: 'Pierre', instructions: 'Historical: 2 long-form/week (Tue & Fri 8 AM Florida), 14 Shorts/week. Confirm or change before recurring tasks are activated.' },
    { project: 'restaurant', title: 'Awaiting prospect decision on restaurant proposal', category: 'Business Operations', type: 'Milestone', status: 'Waiting for Client', priority: 'Medium', responsible: 'Developer' }
  ],

  workflows: [
    { project: 'vape', name: 'Weekly Blog Article', category: 'SEO & Content', responsible: 'Developer', frequency: 'Weekly', weekday: null, active: false, approval_required: true,
      notes: 'Weekday NOT confirmed — set the weekday and switch on after Pierre confirms. Track title, keyword, received date, deadline, publish date and WordPress URL on the matching Content entry.',
      checklist: ['Receive article or topic from Pierre', 'Confirm article requirements', 'Review article content', 'Check grammar and formatting', 'Check images and references', 'Review SEO title', 'Review meta description', 'Review target keyword', 'Check headings and structure', 'Add internal links where appropriate', 'Upload article to WordPress', 'Add featured image', 'Select category and tags', 'Check mobile and desktop layout', 'Verify links and formatting', 'Complete final quality check (incl. compliance)', 'Request client approval if needed', 'Publish article', 'Save published URL', 'Update the content calendar', 'Send completion report'] },
    { project: 'vape', name: 'Website Maintenance', category: 'Website Maintenance', responsible: 'Developer', frequency: 'Weekly', weekday: 'Monday', active: false,
      notes: 'Choose Weekly or Monthly, then switch on.',
      checklist: ['Check website availability', 'Check important pages', 'Check forms', 'Check checkout where applicable', 'Check broken links', 'Review errors', 'Check backups', 'Review security updates', 'Review performance', 'Report problems (create Bug tasks)', 'Record maintenance completion'] },
    { project: 'vape', name: 'Product Management', category: 'Product Management', responsible: 'Developer', frequency: 'Weekly', weekday: 'Wednesday', active: false,
      checklist: ['Receive product information', 'Verify product information', 'Compliance check: permitted for sale/shipment, age restriction, platform & payment policies', 'Prepare product title and description', 'Prepare images', 'Assign category', 'Update price and inventory information', 'Upload product', 'Check product page', 'Confirm completion'] },
    { project: null, name: 'YouTube Long-Form Video', category: 'Video Production', responsible: 'Developer', frequency: 'Weekly', weekday: 'Tuesday', active: false, approval_required: true,
      notes: 'Pick the channel (project) and confirmed publishing days before switching on.',
      checklist: ['Topic research', 'Competitor research', 'Video idea approval', 'Script writing', 'Script review', 'Voiceover', 'Visual asset preparation', 'Video editing', 'Thumbnail', 'Title and description', 'SEO review', 'Client approval', 'Upload', 'Scheduling', 'Publishing', 'Final URL', 'Performance tracking'] },
    { project: null, name: 'YouTube Shorts', category: 'Video Production', responsible: 'Developer', frequency: 'Daily', active: false,
      checklist: ['Select clip or topic', 'Prepare short script', 'Voiceover', 'Edit vertical video', 'Captions', 'Thumbnail / frame', 'Title and description', 'Review', 'Upload', 'Publish', 'Save URL'] },
    { project: 'realestate', name: 'Real Estate Website Build', category: 'Website Development', responsible: 'Developer', frequency: 'Monthly', month_day: 1, active: false,
      notes: 'One-time build checklist — use "Run now" instead of switching on.',
      checklist: ['Confirm requirements', 'Website structure', 'Design', 'Development', 'IDX research and integration', 'Property search', 'Lead capture forms', 'CRM integration', 'Mobile testing', 'SEO', 'Client review', 'Deployment'] },
    { project: 'ams', name: 'Agency Operations', category: 'Business Operations', responsible: 'Developer', frequency: 'Monthly', month_day: 1, active: false,
      checklist: ['Agency branding', 'Website pages', 'Services', 'Portfolio', 'Promotional content', 'Social media', 'Lead forms', 'Business email', 'Client onboarding', 'Proposal preparation'] }
  ]
};
