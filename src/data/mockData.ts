import { Article, Category, Author, Comment, User } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-news',
    name: 'Local News',
    slug: 'local-news',
    description: 'Updates, town hall decisions, and community developments.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'cat-culture',
    name: 'Arts & Culture',
    slug: 'arts-culture',
    description: 'Exhibits, music, local theater, and creative voices.',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'cat-business',
    name: 'Food & Small Business',
    slug: 'food-business',
    description: 'Spotlighting neighborhood cafes, shops, and entrepreneurs.',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'cat-environment',
    name: 'Environment & Parks',
    slug: 'environment-parks',
    description: 'Green spaces, trail maintenance, and sustainability initiatives.',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'cat-history',
    name: 'Neighborhood History',
    slug: 'neighborhood-history',
    description: 'Stories of our streets, heritage buildings, and founders.',
    color: 'bg-stone-100 text-stone-800 border-stone-200',
  },
  {
    id: 'cat-youth',
    name: 'Youth & Education',
    slug: 'youth-education',
    description: 'School achievements, sports teams, and youth programs.',
    color: 'bg-sky-100 text-sky-800 border-sky-200',
  },
];

export const CURRENT_WRITER: Author = {
  id: 'author-me',
  name: 'Elena Rostova',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  bio: 'Oakridge resident for 12 years. Civic advocate, avid gardener, and freelance writer passionate about local urban renewal.',
  badge: 'Local Resident',
  locality: 'Oakridge West',
  articlesCount: 4,
  email: 'elena.r@oakridgevoice.org',
};

export const MOCK_AUTHORS: Author[] = [
  CURRENT_WRITER,
  {
    id: 'author-2',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    bio: 'Retired high school history teacher and local archive volunteer with a passion for architectural preservation.',
    badge: 'Verified Journalist',
    locality: 'River Valley District',
    articlesCount: 18,
    email: 'marcus.vance@oakridge.org',
  },
  {
    id: 'author-3',
    name: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    bio: 'Environmental biologist and member of the Oakridge Urban Tree Canopy Committee.',
    badge: 'Community Leader',
    locality: 'Highland Heights',
    articlesCount: 9,
    email: 'sarah.j@oakridge.org',
  },
  {
    id: 'author-4',
    name: 'Tariq Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    bio: 'Food critic, espresso enthusiast, and founder of the Annual Oakridge Block Party.',
    badge: 'Columnist',
    locality: 'Downtown Core',
    articlesCount: 14,
    email: 'tariq.m@oakridge.org',
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'user-reader-alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@oakridge.org',
    role: 'reader',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    bio: 'Oakridge resident, coffee enthusiast, and local community advocate.',
    badge: 'Local Resident',
    locality: 'Downtown Core',
    savedArticleIds: ['art-1', 'art-3'],
    followedAuthorIds: ['author-me', 'author-2'],
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: 'author-me',
    name: 'Elena Rostova',
    email: 'elena.r@oakridgevoice.org',
    role: 'writer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Oakridge resident for 12 years. Civic advocate, avid gardener, and freelance writer passionate about local urban renewal.',
    badge: 'Local Resident',
    locality: 'Oakridge West',
    savedArticleIds: ['art-1', 'art-2'],
    followedAuthorIds: ['author-2'],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'author-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@oakridge.org',
    role: 'writer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    bio: 'Retired high school history teacher and local archive volunteer with a passion for architectural preservation.',
    badge: 'Verified Journalist',
    locality: 'River Valley District',
    savedArticleIds: ['art-3'],
    followedAuthorIds: [],
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'user-editor-sarah',
    name: 'Dr. Sarah Jenkins',
    email: 'editor@oakridgegazette.org',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    bio: 'Chief Editor at Oakridge Local Gazette & Environmental Biologist.',
    badge: 'Community Leader',
    locality: 'Highland Heights',
    savedArticleIds: ['art-1', 'art-4', 'art-5'],
    followedAuthorIds: ['author-me', 'author-2', 'author-3'],
    createdAt: '2025-11-20T10:00:00Z',
  },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Restoring the Historic Elm Street Farmers Market: What Local Merchants Need',
    slug: 'restoring-historic-elm-street-farmers-market',
    excerpt: 'After two decades of quiet operation, the Elm Street Market is slated for a $1.2M municipal renewal project. Here is how local vendors are shaping the design.',
    content: `
The historic Elm Street Market building has stood at the corner of 4th and Elm since 1928. Originally constructed as a municipal produce terminal, it served three generations of Oakridge residents before falling into partial disrepair in the early 2000s.

Last Tuesday, the City Council unanimously approved the Phase 1 Restoration Grant, dedicating $1.2 million toward modernizing HVAC systems, adding ADA-accessible ramps, and expanding outdoor stall booths.

### What Vendors Are Asking For

During a town hall gathering at the Oakridge Public Library, over 40 local artisans and produce sellers voice key priorities:

1. **Winterized Stalls:** Year-round heating to permit winter farmers markets.
2. **Affordable Stall Rates:** Guaranteeing that long-term local growers are not priced out by corporate pop-ups.
3. **Dedicated Loading Bays:** Reducing morning traffic bottlenecks along Elm Street.

> "This market isn't just a place to buy tomatoes; it's where neighbors catch up on weekly news, where kids get their first summer jobs, and where our community identity lives," said Maria Gomez, owner of Valley Fresh Herbs.

### Construction Timeline

Subcontracting work will commence in mid-September, with minimal interruption to current Saturday operations. The grand reopening is scheduled for late May of next year.

Residents are invited to submit public feedback on the architectural renders at the Municipal Planning Office until August 15th.
    `,
    coverImage: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200',
    author: MOCK_AUTHORS[1],
    category: 'Local News',
    tags: ['ElmStreetMarket', 'CityCouncil', 'UrbanRenewal', 'LocalVendors'],
    locality: 'Downtown Core',
    status: 'published',
    createdAt: '2026-07-20T10:30:00Z',
    updatedAt: '2026-07-21T09:00:00Z',
    publishedAt: '2026-07-21T09:00:00Z',
    readTimeMinutes: 4,
    views: 842,
    likes: 124,
    commentsCount: 18,
    isFeatured: true,
    isEditorPick: true,
  },
  {
    id: 'art-2',
    title: 'Hidden Gem Nooks: 5 Coffee Shops Perfect for Remote Local Writers',
    slug: 'hidden-gem-nooks-5-coffee-shops-for-remote-writers',
    excerpt: 'Looking for fast Wi-Fi, spacious wood tables, and smooth dark roasts in Oakridge? Here are our community-tested favorite spots to put pen to paper.',
    content: `
Finding the ideal writing corner requires a delicate recipe: adequate power outlets, natural ambient light, background noise that inspires rather than distracts, and exceptional coffee.

After testing 14 independent cafes across Oakridge over the past three months, we narrowed down five standout sanctuaries for local authors and columnists.

### 1. The Parchment & Press (Old Town)
Located inside a converted 19th-century bindery on Maple Avenue, this cozy spot boasts floor-to-ceiling bookshelves, quiet mezzanine seats, and single-origin pour-overs.
* **Best feature:** Quiet hours every morning from 8 AM to 10 AM.

### 2. Copper Kettle Espresso (River Valley)
With panoramic views of the river rapids, Copper Kettle is famous for its homemade cardamom buns and expansive outdoor patio equipped with solar charging stations.
* **Best feature:** Abundant power outlets under every booth.

### 3. Solstice Roasters (Highland District)
A spacious warehouse turn-out with lofted ceilings and industrial skylights. If you like high energy and house-roasted Ethiopian beans, this is your studio.

### 4. The Velvet Mug (Westside)
Tucked away in a quiet residential street, this dog-friendly cafe offers velvety oat milk lattes and comfortable wingback armchairs.

### 5. Oakridge Library Cafe Corner
Don't overlook the municipal library's ground floor cafe. Run by a local youth vocational program, it offers the quietest working tables in town at $2.50 an drip coffee.
    `,
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200',
    author: CURRENT_WRITER,
    category: 'Food & Small Business',
    tags: ['CoffeeShops', 'LocalWriters', 'SmallBusiness', 'OakridgeGuide'],
    locality: 'Oakridge West',
    status: 'published',
    createdAt: '2026-07-22T14:15:00Z',
    updatedAt: '2026-07-23T11:20:00Z',
    publishedAt: '2026-07-23T11:20:00Z',
    readTimeMinutes: 5,
    views: 512,
    likes: 89,
    commentsCount: 11,
    isFeatured: false,
    isEditorPick: true,
  },
  {
    id: 'art-3',
    title: 'The Untold Revival of the Old Mill Pond & Its Returning Osprey Family',
    slug: 'untold-revival-old-mill-pond-osprey-family',
    excerpt: 'How five years of community water sampling and invasive plant removal brought nesting ospreys back to our local wetlands for the first time in 40 years.',
    content: `
Thirty years ago, the Old Mill Pond was widely regarded as a dead zone—contaminated by industrial runoff and choked by dense thickets of invasive purple loosestrife.

Today, if you walk along the northern boardwalk at sunrise, you might hear a sharp, metallic whistle echoing across the water. Look up at the nesting platform installed by the local scout troop, and you'll see a magnificent pair of nesting ospreys feeding their two fledglings.

### A Grassroots Ecological Turnaround

The revival did not happen by accident. In 2021, the **Oakridge Watershed Association** initiated monthly water quality testing and led over 300 volunteer hours of wetland restoration.

Key milestones achieved:
- **1,400 Native Wetland Shrubs Planted:** Including buttonbush and winterberry.
- **Runoff Filtration Basins:** Built alongside the adjacent highway bypass.
- **Community Water Monitoring:** Involving students from Oakridge High School Science Department.

> "Wildlife returns when habitat integrity is restored," explains Dr. Sarah Jenkins. "The osprey is an apex indicator species. Their successful breeding means the fish population is thriving once again."

### Guided Nature Walks

The Watershed Association will host guided birdwatching tours every Sunday morning throughout August. Binoculars will be provided free of charge at the Trailhead Visitor Center.
    `,
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
    author: MOCK_AUTHORS[2],
    category: 'Environment & Parks',
    tags: ['MillPond', 'WildlifeRevival', 'OakridgeParks', 'CommunityAction'],
    locality: 'River Valley District',
    status: 'published',
    createdAt: '2026-07-18T09:00:00Z',
    updatedAt: '2026-07-19T10:00:00Z',
    publishedAt: '2026-07-19T10:00:00Z',
    readTimeMinutes: 6,
    views: 1120,
    likes: 215,
    commentsCount: 24,
    isFeatured: true,
    isEditorPick: false,
  },
  {
    id: 'art-4',
    title: 'Oakridge High Robotics Team "Steel Falcons" Secures Spot at State Championship',
    slug: 'oakridge-high-robotics-team-steel-falcons-state-championship',
    excerpt: 'Building a 120lb autonomous robot from scrap materials in a garage, six local high school students beat 32 regional schools to advance to the State Finals.',
    content: `
The Steel Falcons, Oakridge High School's student-led robotics club, proved that determination and creative engineering outweigh big school budgets.

Competing at the Tri-County FIRST Robotics Invitational in Metro City last weekend, team #4092 earned 1st place in autonomous navigation and took home the prestigious Engineering Inspiration Award.

### The Robot: "Rusty Falcon"

Designed and assembled in coach Mr. Davis's home workshop over 14 intense weeks, the robot features:
- A custom 3D-printed intake mechanism for picking up game spheres.
- Dual LiDAR vision sensors for precise obstacle avoidance.
- A lightweight aluminum chassis donated by Oakridge Machine Shop.

"We didn't have the $15,000 corporate sponsorships that magnet schools had," said team captain Maya Lin (Senior). "So we spent late nights testing sensor code and optimizing our driver controls."

### Community Fundraising for Finals

To compete at the State Championship in Springfield next month, the team needs $4,500 for travel, spare parts, and registration fees. A car wash and bake sale will take place this Saturday at the Oakridge Community Center parking lot.
    `,
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    author: CURRENT_WRITER,
    category: 'Youth & Education',
    tags: ['OakridgeHigh', 'SteelFalcons', 'Robotics', 'YouthSTEM'],
    locality: 'Highland Heights',
    status: 'published',
    createdAt: '2026-07-24T16:00:00Z',
    updatedAt: '2026-07-25T08:30:00Z',
    publishedAt: '2026-07-25T08:30:00Z',
    readTimeMinutes: 4,
    views: 630,
    likes: 142,
    commentsCount: 15,
    isFeatured: false,
    isEditorPick: false,
  },
  {
    id: 'art-5',
    title: 'Proposal for Expanded Weekend Pedestrian Zone on Main Street',
    slug: 'proposal-expanded-weekend-pedestrian-zone-main-street',
    excerpt: 'A citizen petition proposes closing two blocks of Main Street to vehicle traffic every Sunday to foster outdoor dining, acoustic music, and safe family strolling.',
    content: `
As cities nationwide embrace car-free streets to bolster pedestrian safety and neighborhood vitality, a coalition of Oakridge residents has submitted a formal petition to the Traffic & Transportation Board.

The proposal suggests transforming Main Street between 2nd Avenue and 4th Avenue into a pedestrian-only zone every Sunday from 9:00 AM to 6:00 PM throughout summer and autumn.

### Proposed Benefits
- **Dine Out Open Air:** Restaurants can extend patio seating onto the asphalt.
- **Busking & Local Performers:** Designated busking spots for local musicians without noise permit fees.
- **Family Bike & Stroller Safety:** Safe thoroughfare for children and seniors.

### Concerns Raised by Store Owners
Some retail business owners on 3rd Avenue have expressed concern regarding customer parking accessibility and delivery schedules. The proposal includes designated 15-minute pickup zones on cross-streets to accommodate curbside orders.

Editorial Note: This article is currently under editorial review and pending public comment synthesis.
    `,
    coverImage: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200',
    author: CURRENT_WRITER,
    category: 'Local News',
    tags: ['MainStreet', 'PedestrianZone', 'UrbanPlanning', 'CommunityPetition'],
    locality: 'Downtown Core',
    status: 'submitted',
    createdAt: '2026-07-25T11:00:00Z',
    updatedAt: '2026-07-25T11:00:00Z',
    readTimeMinutes: 3,
    views: 45,
    likes: 8,
    commentsCount: 2,
    editorialReview: {
      reviewedBy: 'Editor Board',
      reviewedAt: '2026-07-25T15:30:00Z',
      rating: 4,
      localRelevanceScore: 92,
      strengths: [
        'Clear presentation of both merchant concerns and resident benefits.',
        'Strong local civic angle that directly affects Main Street businesses.',
      ],
      areasToImprove: [
        'Add a short quote or statement from the Traffic Board chair if available.',
        'Clarify parking options on 2nd and 4th Avenues.',
      ],
      recommendation: 'Minor revisions needed',
      feedbackText: 'Great civic piece! Please address the minor point about parking availability on cross-streets, then we are ready to publish.',
    },
  },
  {
    id: 'art-6',
    title: 'Draft: Memories of the Oakridge Heritage Apple Festival (1975–2000)',
    slug: 'draft-memories-oakridge-heritage-apple-festival',
    excerpt: 'An archival retrospective looking back at the annual harvest celebration that drew visitors from across three counties for pie contests and cider pressing.',
    content: `
In the autumns of the late 20th century, Oakridge smelled like warm cinnamon, pressed apple skins, and woodsmoke.

The annual Heritage Apple Festival was the highlight of the calendar year. Founded in 1975 by the Oakridge Historical Society, the three-day harvest festival celebrated our town's rich orchard heritage.

[Draft Note to Self: Insert photos of the 1984 Pie Baking Contest from municipal archives. Need to interview Mrs. Gable about her famous lattice crust technique.]

### The Famous Pressing Machine
At the center of the festival square sat a 1912 belt-driven cider press powered by a restored John Deere tractor. Families brought wooden bushels of McIntosh and Honeycrisp apples to be crushed into unfiltered sweet cider.
    `,
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1200',
    author: CURRENT_WRITER,
    category: 'Neighborhood History',
    tags: ['AppleFestival', 'OakridgeHistory', 'Heritage', 'Memories'],
    locality: 'Oakridge West',
    status: 'draft',
    createdAt: '2026-07-26T08:00:00Z',
    updatedAt: '2026-07-26T08:00:00Z',
    readTimeMinutes: 3,
    views: 12,
    likes: 2,
    commentsCount: 0,
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    articleId: 'art-1',
    authorName: 'David K.',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    content: 'As a vendor who has had a booth on Elm Street for 8 years, winterized stalls will be a total gamechanger for our honey and dried herb business! Thank you for covering this.',
    createdAt: '2026-07-21T11:30:00Z',
    likes: 14,
    isVerifiedResident: true,
  },
  {
    id: 'comm-2',
    articleId: 'art-1',
    authorName: 'Samantha Chu',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    content: 'I hope they keep the original timber rafters in the main hall. That historic character is what makes Elm Street Market feel special.',
    createdAt: '2026-07-21T14:10:00Z',
    likes: 8,
    isVerifiedResident: true,
  },
  {
    id: 'comm-3',
    articleId: 'art-2',
    authorName: 'Carlos M.',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    content: 'Parchment & Press is my absolute favorite! Their oat milk cappuccinos are legendary and the quiet hours really help me get deep writing done.',
    createdAt: '2026-07-23T15:45:00Z',
    likes: 5,
    isVerifiedResident: false,
  },
];
