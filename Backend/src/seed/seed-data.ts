/* Shared seed data + domain types. Mirrored at Backend/src/seed/seed-data.ts — keep in sync. */

export type ContentType = 'Video' | 'Image' | 'Animation' | '3D' | 'Motion Graphics';
export type Availability = 'Available' | 'Limited' | 'Booked';

export interface VerificationSignal {
  type: 'portfolio' | 'tools' | 'workflow' | 'identity';
  label: string;
  verified: boolean;
}

export interface WorkflowStep {
  step: string;
  description: string;
}

export interface PortfolioItem {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  thumbnail: string;
  mediaUrl: string;
  contentType: ContentType;
  tools: string[];
  tags: string[];
  views: number;
  likes: number;
  createdAt: string;
}

export interface Creator {
  id: string;
  userId?: string;
  name: string;
  username: string;
  avatar: string;
  cover: string;
  headline: string;
  bio: string;
  location: string;
  specialization: string[];
  focusAreas: string[];
  skills: string[];
  tools: string[];
  contentTypes: ContentType[];
  experience: number;
  rating: number;
  reviews: number;
  projectsCompleted: number;
  hourlyRate: number;
  availability: Availability;
  responseTime: string;
  verified: boolean;
  verification: VerificationSignal[];
  workflow: WorkflowStep[];
  featured: boolean;
  portfolio?: PortfolioItem[];
}

export interface Brief {
  id: string;
  brandId?: string;
  brandName: string;
  brandLogo?: string;
  title: string;
  description: string;
  contentType: ContentType;
  style: string;
  mood?: string;
  reference?: string;
  visualDirection?: string;
  aspectRatio: string;
  platform: string[];
  commercialUse: 'Personal' | 'Commercial' | 'Full commercial rights';
  budget: string;
  startDate?: string;
  deadline: string;
  requiredSkills: string[];
  invitedCreatorId?: string;
  applicants: number;
  status: 'open' | 'in_review' | 'closed';
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
}

const img = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const SPECIALIZATIONS = [
  'AI Filmmaker',
  'AI Animator',
  'AI Designer',
  'Generative Artist',
  '3D Artist',
  'Motion Designer',
];

export const CONTENT_TYPES: ContentType[] = ['Video', 'Image', 'Animation', '3D', 'Motion Graphics'];

export const TOOLS: Tool[] = [
  { id: 'midjourney', name: 'Midjourney', category: 'Image', description: 'Stylized image generation and concept art.' },
  { id: 'runway', name: 'Runway', category: 'Video', description: 'Gen-3 video generation, motion brush and editing.' },
  { id: 'sora', name: 'Sora', category: 'Video', description: 'Long-form cinematic text-to-video.' },
  { id: 'kling', name: 'Kling', category: 'Video', description: 'High-fidelity image-to-video with realistic motion.' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', category: 'Image', description: 'Open-weight image models with fine control.' },
  { id: 'flux', name: 'Flux', category: 'Image', description: 'Photoreal image generation with strong typography.' },
  { id: 'blender', name: 'Blender', category: '3D', description: '3D modeling, rendering and compositing.' },
  { id: 'comfyui', name: 'ComfyUI', category: 'Pipeline', description: 'Node-based diffusion pipelines and automation.' },
  { id: 'pika', name: 'Pika', category: 'Video', description: 'Fast stylized video and effects generation.' },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'Audio', description: 'Voiceover, dubbing and sound design.' },
];

export const SKILLS: Skill[] = [
  { id: 'cinematic-storytelling', name: 'Cinematic Storytelling', category: 'Direction' },
  { id: 'prompt-engineering', name: 'Prompt Engineering', category: 'Generation' },
  { id: 'color-grading', name: 'Color Grading', category: 'Post' },
  { id: 'video-editing', name: 'Video Editing', category: 'Post' },
  { id: 'character-design', name: 'Character Design', category: 'Design' },
  { id: 'product-visualization', name: 'Product Visualization', category: 'Commercial' },
  { id: 'fashion-editorial', name: 'Fashion Editorial', category: 'Commercial' },
  { id: '3d-modeling', name: '3D Modeling', category: '3D' },
  { id: 'compositing', name: 'Compositing', category: 'Post' },
  { id: 'sound-design', name: 'Sound Design', category: 'Audio' },
  { id: 'storyboarding', name: 'Storyboarding', category: 'Direction' },
  { id: 'brand-identity', name: 'Brand Identity', category: 'Design' },
  { id: 'lighting-rendering', name: 'Lighting & Rendering', category: '3D' },
  { id: 'worldbuilding', name: 'Worldbuilding', category: 'Direction' },
  { id: 'upscaling-retouching', name: 'Upscaling & Retouching', category: 'Post' },
  { id: 'lora-training', name: 'LoRA Training', category: 'Generation' },
];

const defaultWorkflow: WorkflowStep[] = [
  { step: 'Concept', description: 'Moodboards, references and narrative direction aligned with the brief.' },
  { step: 'Prompting', description: 'Structured prompt systems, seeds and style references for consistency.' },
  { step: 'Generation', description: 'Iterative generation across tools, selecting the strongest takes.' },
  { step: 'Editing', description: 'Compositing, grading, upscaling and sound in a traditional NLE.' },
  { step: 'Final Delivery', description: 'Platform-ready masters in every required aspect ratio.' },
];

const fullVerification = (tools = true, workflow = true): VerificationSignal[] => [
  { type: 'identity', label: 'Identity Verified', verified: true },
  { type: 'portfolio', label: 'Portfolio Verified', verified: true },
  { type: 'tools', label: 'Tool Experience Verified', verified: tools },
  { type: 'workflow', label: 'Workflow Verified', verified: workflow },
];

type CreatorSeed = Omit<Creator, 'workflow' | 'verification' | 'id'> & {
  workflow?: WorkflowStep[];
  verification?: VerificationSignal[];
};

const creatorSeeds: CreatorSeed[] = [
  {
    name: 'Aarav Mehta',
    username: 'aarav-mehta',
    avatar: img('photo-1507003211169-0a1dd7228f2d', 400),
    cover: img('photo-1514565131-fce0801e5785', 1800),
    headline: 'Cinematic AI films for brands that want to be remembered.',
    bio: 'Former commercial director turned AI filmmaker. I blend traditional cinematography with generative video to produce launch films, brand anthems and music videos for clients across India and the Middle East. Every frame is directed — never random.',
    location: 'Mumbai, India',
    specialization: ['AI Filmmaker', 'Motion Designer'],
    focusAreas: ['AI Filmmaking', 'Product Advertising', 'Cinematic Storytelling'],
    skills: ['Cinematic Storytelling', 'Prompt Engineering', 'Color Grading', 'Video Editing', 'Storyboarding'],
    tools: ['Runway', 'Kling', 'Midjourney', 'Sora', 'ElevenLabs'],
    contentTypes: ['Video', 'Motion Graphics'],
    experience: 8,
    rating: 4.9,
    reviews: 87,
    projectsCompleted: 124,
    hourlyRate: 95,
    availability: 'Available',
    responseTime: '< 2 hours',
    verified: true,
    featured: true,
    workflow: [
      { step: 'Concept', description: 'Treatment, script beats and a shot list built with the brand team.' },
      { step: 'Prompting', description: 'Midjourney style frames locked as visual references for every scene.' },
      { step: 'Generation', description: 'Runway and Kling for motion, Sora for long establishing shots.' },
      { step: 'Editing', description: 'Cut, grade and sound design in DaVinci Resolve with ElevenLabs VO.' },
      { step: 'Final Delivery', description: '4K masters plus 9:16 and 1:1 cutdowns for social.' },
    ],
  },
  {
    name: 'Sofia Laurent',
    username: 'sofia-laurent',
    avatar: img('photo-1494790108377-be9c29b29330', 400),
    cover: img('photo-1509347528160-9a9e33742cdb', 1800),
    headline: 'Editorial AI imagery for fashion and luxury houses.',
    bio: 'Paris-based art director creating AI-native fashion campaigns. I train custom LoRAs on collections so garments stay accurate, then build editorial worlds around them. Clients include emerging couture labels and beauty brands.',
    location: 'Paris, France',
    specialization: ['AI Designer', 'Generative Artist'],
    focusAreas: ['Fashion Campaigns', 'Luxury Editorial', 'Beauty'],
    skills: ['Fashion Editorial', 'Prompt Engineering', 'LoRA Training', 'Upscaling & Retouching', 'Brand Identity'],
    tools: ['Midjourney', 'Flux', 'Stable Diffusion', 'ComfyUI'],
    contentTypes: ['Image'],
    experience: 6,
    rating: 4.8,
    reviews: 64,
    projectsCompleted: 91,
    hourlyRate: 110,
    availability: 'Limited',
    responseTime: '< 4 hours',
    verified: true,
    featured: true,
  },
  {
    name: 'Kenji Watanabe',
    username: 'kenji-watanabe',
    avatar: img('photo-1500648767791-00dcc994a43e', 400),
    cover: img('photo-1634017839464-5c339ebe3cb4', 1800),
    headline: 'Hybrid 3D + diffusion pipelines for product launches.',
    bio: 'Tokyo-based 3D artist building hybrid pipelines: hero products modeled in Blender, environments and textures generated through ComfyUI. Precise where it matters, generative where it scales.',
    location: 'Tokyo, Japan',
    specialization: ['3D Artist', 'Generative Artist'],
    focusAreas: ['Product Visualization', 'Tech Launches', 'Abstract 3D'],
    skills: ['3D Modeling', 'Lighting & Rendering', 'Product Visualization', 'Compositing', 'Prompt Engineering'],
    tools: ['Blender', 'ComfyUI', 'Stable Diffusion', 'Runway'],
    contentTypes: ['3D', 'Image', 'Video'],
    experience: 10,
    rating: 5.0,
    reviews: 112,
    projectsCompleted: 156,
    hourlyRate: 120,
    availability: 'Available',
    responseTime: '< 6 hours',
    verified: true,
    featured: true,
  },
  {
    name: 'Maya Okafor',
    username: 'maya-okafor',
    avatar: img('photo-1544005313-94ddf0286df2', 400),
    cover: img('photo-1557672172-298e090bd0f1', 1800),
    headline: 'Character-driven AI animation with real emotional range.',
    bio: 'Animator and storyteller working between Lagos and London. I build consistent AI characters and bring them to life in short-form series, explainers and brand mascots.',
    location: 'Lagos, Nigeria',
    specialization: ['AI Animator'],
    focusAreas: ['Character Animation', 'Short-form Series', 'Brand Mascots'],
    skills: ['Character Design', 'Storyboarding', 'Cinematic Storytelling', 'Sound Design', 'Video Editing'],
    tools: ['Runway', 'Kling', 'ComfyUI', 'Midjourney', 'ElevenLabs'],
    contentTypes: ['Animation', 'Video'],
    experience: 5,
    rating: 4.9,
    reviews: 41,
    projectsCompleted: 58,
    hourlyRate: 80,
    availability: 'Available',
    responseTime: '< 3 hours',
    verified: true,
    featured: true,
  },
  {
    name: 'Lucas Ferreira',
    username: 'lucas-ferreira',
    avatar: img('photo-1506794778202-cad84cf45f1d', 400),
    cover: img('photo-1618005182384-a83a8bd57fbe', 1800),
    headline: 'Kinetic motion systems for brands that move fast.',
    bio: 'Motion designer from São Paulo. I combine Blender, After Effects and generative video to create logo reveals, kinetic typography and launch loops that feel handcrafted.',
    location: 'São Paulo, Brazil',
    specialization: ['Motion Designer', '3D Artist'],
    focusAreas: ['Brand Motion', 'Launch Loops', 'Kinetic Type'],
    skills: ['Brand Identity', 'Compositing', '3D Modeling', 'Video Editing', 'Lighting & Rendering'],
    tools: ['Runway', 'Blender', 'Midjourney', 'Pika'],
    contentTypes: ['Motion Graphics', '3D', 'Animation'],
    experience: 7,
    rating: 4.7,
    reviews: 53,
    projectsCompleted: 77,
    hourlyRate: 75,
    availability: 'Limited',
    responseTime: '< 5 hours',
    verified: true,
    featured: true,
  },
  {
    name: 'Priya Raman',
    username: 'priya-raman',
    avatar: img('photo-1534528741775-53994a69daeb', 400),
    cover: img('photo-1620641788421-7a1c342ea42e', 1800),
    headline: 'Generative art systems at the edge of code and canvas.',
    bio: 'Generative artist and technologist in Bengaluru. I design custom ComfyUI pipelines that turn brand assets into endless on-brand variations for campaigns, installations and drops.',
    location: 'Bengaluru, India',
    specialization: ['Generative Artist', 'AI Designer'],
    focusAreas: ['Generative Systems', 'Installations', 'Campaign Variations'],
    skills: ['Prompt Engineering', 'LoRA Training', 'Brand Identity', 'Worldbuilding', 'Upscaling & Retouching'],
    tools: ['ComfyUI', 'Stable Diffusion', 'Flux', 'Midjourney'],
    contentTypes: ['Image', 'Animation'],
    experience: 4,
    rating: 4.8,
    reviews: 29,
    projectsCompleted: 46,
    hourlyRate: 70,
    availability: 'Available',
    responseTime: '< 2 hours',
    verified: true,
    featured: true,
  },
  {
    name: 'Daniel Kim',
    username: 'daniel-kim',
    avatar: img('photo-1472099645785-5658abf4ff4e', 400),
    cover: img('photo-1536440136628-849c177e76a1', 1800),
    headline: 'Narrative AI short films and music videos.',
    bio: 'Seoul-born, LA-based director. My AI shorts have screened at three festivals. I bring the discipline of a film set — shot lists, continuity, coverage — to generative video.',
    location: 'Seoul, South Korea',
    specialization: ['AI Filmmaker'],
    focusAreas: ['Music Videos', 'Short Films', 'Cinematic Storytelling'],
    skills: ['Cinematic Storytelling', 'Storyboarding', 'Color Grading', 'Sound Design', 'Worldbuilding'],
    tools: ['Sora', 'Runway', 'Kling', 'ElevenLabs'],
    contentTypes: ['Video'],
    experience: 6,
    rating: 4.8,
    reviews: 38,
    projectsCompleted: 52,
    hourlyRate: 100,
    availability: 'Booked',
    responseTime: '< 12 hours',
    verified: true,
    featured: false,
  },
  {
    name: 'Elena Petrova',
    username: 'elena-petrova',
    avatar: img('photo-1438761681033-6461ffad8d80', 400),
    cover: img('photo-1558591710-4b4a1ae0f04d', 1800),
    headline: 'Photoreal product and lifestyle imagery at scale.',
    bio: 'Berlin-based AI designer specializing in e-commerce and lifestyle visuals. I replace expensive shoots with photoreal Flux pipelines that keep products pixel-accurate.',
    location: 'Berlin, Germany',
    specialization: ['AI Designer'],
    focusAreas: ['E-commerce', 'Lifestyle', 'Product Advertising'],
    skills: ['Product Visualization', 'Prompt Engineering', 'Upscaling & Retouching', 'Compositing', 'Brand Identity'],
    tools: ['Flux', 'Midjourney', 'ComfyUI', 'Stable Diffusion'],
    contentTypes: ['Image'],
    experience: 3,
    rating: 4.6,
    reviews: 22,
    projectsCompleted: 34,
    hourlyRate: 60,
    availability: 'Available',
    responseTime: '< 4 hours',
    verified: false,
    featured: false,
    verification: fullVerification(true, false),
  },
  {
    name: 'Omar Haddad',
    username: 'omar-haddad',
    avatar: img('photo-1539571696357-5a69c17a67c6', 400),
    cover: img('photo-1635070041078-e363dbe005cb', 1800),
    headline: 'Luxury 3D worlds for real estate, auto and hospitality.',
    bio: 'Dubai-based 3D artist building immersive worlds for luxury real estate and automotive launches. Blender for precision, Kling and Pika for fast cinematic motion.',
    location: 'Dubai, UAE',
    specialization: ['3D Artist', 'Motion Designer'],
    focusAreas: ['Architecture', 'Automotive', 'Luxury Hospitality'],
    skills: ['3D Modeling', 'Lighting & Rendering', 'Worldbuilding', 'Compositing', 'Color Grading'],
    tools: ['Blender', 'Kling', 'Pika', 'Midjourney'],
    contentTypes: ['3D', 'Motion Graphics', 'Video'],
    experience: 9,
    rating: 4.7,
    reviews: 47,
    projectsCompleted: 83,
    hourlyRate: 105,
    availability: 'Limited',
    responseTime: '< 8 hours',
    verified: true,
    featured: false,
  },
  {
    name: 'Zara Ahmed',
    username: 'zara-ahmed',
    avatar: img('photo-1580489944761-15a19d654956', 400),
    cover: img('photo-1550684848-fac1c5b4e853', 1800),
    headline: 'Playful AI animation for social-first brands.',
    bio: 'London animator making scroll-stopping AI animation for TikTok and Reels. Fast turnaround, strong hooks, and characters audiences actually remember.',
    location: 'London, UK',
    specialization: ['AI Animator', 'Motion Designer'],
    focusAreas: ['Social Content', 'UGC-style Ads', 'Character Loops'],
    skills: ['Character Design', 'Video Editing', 'Sound Design', 'Storyboarding', 'Prompt Engineering'],
    tools: ['Pika', 'Runway', 'Midjourney', 'ElevenLabs'],
    contentTypes: ['Animation', 'Motion Graphics', 'Video'],
    experience: 2,
    rating: 4.6,
    reviews: 18,
    projectsCompleted: 27,
    hourlyRate: 55,
    availability: 'Available',
    responseTime: '< 1 hour',
    verified: false,
    featured: false,
    verification: fullVerification(false, false),
  },
  {
    name: 'Rohan Kapoor',
    username: 'rohan-kapoor',
    avatar: img('photo-1531746020798-e6953c6e8e04', 400),
    cover: img('photo-1519608487953-e999c86e7455', 1800),
    headline: 'High-energy AI ads for D2C and fintech brands.',
    bio: 'Delhi-based AI filmmaker producing performance-driven video ads. I test multiple creative hooks fast, then scale the winners into polished campaign films.',
    location: 'New Delhi, India',
    specialization: ['AI Filmmaker', 'AI Designer'],
    focusAreas: ['Performance Ads', 'D2C Brands', 'Product Advertising'],
    skills: ['Video Editing', 'Prompt Engineering', 'Product Visualization', 'Color Grading', 'Cinematic Storytelling'],
    tools: ['Kling', 'Runway', 'Midjourney', 'Flux'],
    contentTypes: ['Video', 'Image'],
    experience: 3,
    rating: 4.7,
    reviews: 26,
    projectsCompleted: 39,
    hourlyRate: 50,
    availability: 'Available',
    responseTime: '< 2 hours',
    verified: true,
    featured: false,
  },
  {
    name: 'Chloe Martin',
    username: 'chloe-martin',
    avatar: img('photo-1517841905240-472988babdf9', 400),
    cover: img('photo-1541701494587-cb58502866ab', 1800),
    headline: 'Dreamlike generative worlds for music and culture.',
    bio: 'New York generative artist creating album art, visualizers and gallery pieces. My work lives where surrealism meets precise diffusion control.',
    location: 'New York, USA',
    specialization: ['Generative Artist', 'AI Animator'],
    focusAreas: ['Album Art', 'Visualizers', 'Gallery Work'],
    skills: ['Worldbuilding', 'LoRA Training', 'Prompt Engineering', 'Compositing', 'Color Grading'],
    tools: ['Stable Diffusion', 'ComfyUI', 'Flux', 'Runway'],
    contentTypes: ['Image', 'Animation', 'Video'],
    experience: 5,
    rating: 4.9,
    reviews: 44,
    projectsCompleted: 61,
    hourlyRate: 90,
    availability: 'Limited',
    responseTime: '< 6 hours',
    verified: true,
    featured: false,
  },
];

export const CREATORS: Creator[] = creatorSeeds.map((c) => ({
  ...c,
  id: c.username,
  workflow: c.workflow ?? defaultWorkflow,
  verification: c.verification ?? fullVerification(),
}));

type P = [string, string, ContentType, string[], string[], string, string];
// [creatorId, title, contentType, tools, tags, imageId, description]
const portfolioSeeds: P[] = [
  ['aarav-mehta', 'Neon Mumbai', 'Video', ['Runway', 'Midjourney'], ['cyberpunk', 'city', 'night'], 'photo-1514565131-fce0801e5785', 'A 60-second neon-noir love letter to Mumbai after midnight, built from 400+ generated shots.'],
  ['aarav-mehta', 'Future of Mobility', 'Video', ['Kling', 'Sora'], ['automotive', 'launch', 'commercial'], 'photo-1550745165-9bc0b252726f', 'Launch film for an EV startup imagining commutes in 2040.'],
  ['aarav-mehta', 'Cyberpunk Fashion Film', 'Video', ['Runway', 'Kling', 'ElevenLabs'], ['fashion', 'cyberpunk', 'film'], 'photo-1519608487953-e999c86e7455', 'Streetwear campaign film with rain-soaked neon alleys and chrome couture.'],
  ['sofia-laurent', 'Maison Lumière SS26', 'Image', ['Flux', 'ComfyUI'], ['fashion', 'editorial', 'luxury'], 'photo-1509347528160-9a9e33742cdb', 'Spring/Summer editorial with garment-accurate LoRA renders.'],
  ['sofia-laurent', 'Velvet Hour', 'Image', ['Midjourney', 'Stable Diffusion'], ['beauty', 'portrait'], 'photo-1515886657613-9f3515b0c78f', 'Beauty campaign exploring golden-hour skin tones and soft velvet textures.'],
  ['sofia-laurent', 'Atelier Dreams', 'Image', ['Midjourney'], ['fashion', 'surreal'], 'photo-1490481651871-ab68de25d43d', 'Surreal atelier scenes for a couture house lookbook.'],
  ['kenji-watanabe', 'Chromatic Form 01', '3D', ['Blender', 'ComfyUI'], ['abstract', '3d', 'render'], 'photo-1634017839464-5c339ebe3cb4', 'Abstract hero render series for a consumer electronics launch.'],
  ['kenji-watanabe', 'Sonic Wireless Launch', '3D', ['Blender', 'Stable Diffusion'], ['product', 'audio'], 'photo-1505740420928-5e560c06d30e', 'Hybrid product visuals — modeled headphones in generated environments.'],
  ['kenji-watanabe', 'Liquid Glass', '3D', ['Blender', 'Runway'], ['abstract', 'motion'], 'photo-1617791160505-6f00504e3519', 'Liquid glass simulation loops animated with Runway motion.'],
  ['maya-okafor', 'Ada & the Robot', 'Animation', ['Runway', 'Midjourney', 'ElevenLabs'], ['character', 'series'], 'photo-1557672172-298e090bd0f1', 'Five-episode animated series with a consistent AI-designed heroine.'],
  ['maya-okafor', 'Lagos 3000', 'Animation', ['Kling', 'ComfyUI'], ['afrofuturism', 'worldbuilding'], 'photo-1563089145-599997674d42', 'Afrofuturist city animation commissioned for a culture festival.'],
  ['maya-okafor', 'Mascot Reboot', 'Animation', ['Kling', 'Midjourney'], ['mascot', 'brand'], 'photo-1579546929518-9e396f3cc809', 'Reimagined a snack brand mascot as a fully animated character.'],
  ['lucas-ferreira', 'Pulse Identity', 'Motion Graphics', ['Blender', 'Runway'], ['branding', 'logo'], 'photo-1618005182384-a83a8bd57fbe', 'Motion identity system for a fintech brand, 40+ animated assets.'],
  ['lucas-ferreira', 'Carnival Loops', 'Motion Graphics', ['Pika', 'Midjourney'], ['loops', 'social'], 'photo-1550684848-fac1c5b4e853', 'Vibrant social loops inspired by São Paulo carnival.'],
  ['lucas-ferreira', 'Orbit Reveal', '3D', ['Blender'], ['logo', '3d'], 'photo-1604871000636-074fa5117945', 'Orbital 3D logo reveal for a satellite startup.'],
  ['priya-raman', 'Infinite Kolam', 'Image', ['ComfyUI', 'Stable Diffusion'], ['generative', 'culture'], 'photo-1620641788421-7a1c342ea42e', 'Generative system producing infinite variations of traditional kolam patterns.'],
  ['priya-raman', 'Monsoon Drift', 'Animation', ['ComfyUI', 'Flux'], ['abstract', 'nature'], 'photo-1614850523459-c2f4c699c52e', 'Flowing abstract animation projected at a Bengaluru art festival.'],
  ['priya-raman', 'Brand Variations Engine', 'Image', ['Flux', 'ComfyUI'], ['campaign', 'automation'], 'photo-1558618666-fcd25c85cd64', '1,200 on-brand campaign variants generated from a single brand kit.'],
  ['daniel-kim', 'Last Light', 'Video', ['Sora', 'Runway'], ['short film', 'drama'], 'photo-1536440136628-849c177e76a1', 'Festival-selected AI short about the last sunset on Earth.'],
  ['daniel-kim', 'Seoul Static', 'Video', ['Kling', 'ElevenLabs'], ['music video', 'city'], 'photo-1542751371-adc38448a05e', 'Music video for an indie K-pop act shot entirely with generative video.'],
  ['daniel-kim', 'Paper Moons', 'Video', ['Sora'], ['cinematic', 'dream'], 'photo-1478720568477-152d9b164e26', 'Dreamlike cinematic piece exploring memory and film grain.'],
  ['elena-petrova', 'Nordic Living', 'Image', ['Flux'], ['lifestyle', 'interior'], 'photo-1493246507139-91e8fad9978e', 'Lifestyle imagery for a Scandinavian homeware brand.'],
  ['elena-petrova', 'Timepiece Studio', 'Image', ['Flux', 'ComfyUI'], ['product', 'luxury'], 'photo-1523275335684-37898b6baf30', 'Watch product shots replacing a full studio shoot.'],
  ['elena-petrova', 'Sneaker Drop', 'Image', ['Midjourney', 'Flux'], ['product', 'streetwear'], 'photo-1542291026-7eec264c27ff', 'Hero visuals for a limited sneaker release.'],
  ['omar-haddad', 'Desert Pavilion', '3D', ['Blender', 'Kling'], ['architecture', 'luxury'], 'photo-1549880338-65ddcdfd017b', 'Architectural visualization of a luxury desert resort.'],
  ['omar-haddad', 'Midnight GT', 'Motion Graphics', ['Blender', 'Pika'], ['automotive', 'launch'], 'photo-1635070041078-e363dbe005cb', 'Automotive reveal sequence for a regional GT launch.'],
  ['omar-haddad', 'Sky Residences', '3D', ['Blender', 'Midjourney'], ['real estate', '3d'], 'photo-1470071459604-3b5ec3a7fe05', 'Immersive 3D walkthrough stills for a premium residential tower.'],
  ['zara-ahmed', 'Snack Attack', 'Animation', ['Pika', 'ElevenLabs'], ['social', 'tiktok'], 'photo-1574169208507-84376144848b', 'Viral TikTok series — 4.2M views across 12 episodes.'],
  ['zara-ahmed', 'Tiny Commuters', 'Animation', ['Runway', 'Midjourney'], ['character', 'loop'], 'photo-1561214115-f2f134cc4912', 'Looping character animations for a transit app campaign.'],
  ['zara-ahmed', 'Pop Bubble', 'Motion Graphics', ['Pika'], ['playful', 'social'], 'photo-1579546929518-9e396f3cc809', 'Bubbly motion graphics pack for a beverage brand.'],
  ['rohan-kapoor', 'PayFast Launch', 'Video', ['Kling', 'Runway'], ['fintech', 'ad'], 'photo-1611162617474-5b21e879e113', 'Performance ad campaign that beat CPA targets by 38%.'],
  ['rohan-kapoor', 'Chai Culture', 'Video', ['Kling', 'Midjourney'], ['d2c', 'food'], 'photo-1525547719571-a2d4ac8945e2', 'Warm cinematic ad for a D2C tea brand.'],
  ['rohan-kapoor', 'Glow Serum', 'Image', ['Flux'], ['beauty', 'product'], 'photo-1572635196237-14b3f281503f', 'Product key visuals for a skincare launch.'],
  ['chloe-martin', 'Astral Garden', 'Image', ['Stable Diffusion', 'ComfyUI'], ['surreal', 'album art'], 'photo-1462331940025-496dfbfc7564', 'Album artwork series for an electronic music label.'],
  ['chloe-martin', 'Neural Bloom', 'Animation', ['ComfyUI', 'Runway'], ['visualizer', 'music'], 'photo-1541701494587-cb58502866ab', 'Audio-reactive visualizer for a headline festival set.'],
  ['chloe-martin', 'Orbiting Silence', 'Video', ['Runway', 'Flux'], ['space', 'cinematic'], 'photo-1446776811953-b23d57bd21aa', 'Meditative cinematic piece exhibited in a Brooklyn gallery.'],
];

export const PORTFOLIO: PortfolioItem[] = portfolioSeeds.map(([creatorId, title, contentType, tools, tags, imageId, description], i) => ({
  id: `p${i + 1}`,
  creatorId,
  title,
  description,
  thumbnail: img(imageId, 1000),
  mediaUrl: img(imageId, 2000),
  contentType,
  tools,
  tags,
  views: 1200 + ((i * 7919) % 18000),
  likes: 80 + ((i * 3571) % 1400),
  createdAt: new Date(Date.UTC(2026, 8 - (i % 9), 1 + (i % 27))).toISOString(),
}));

export const BRIEFS: Brief[] = [
  {
    id: 'b1',
    brandName: 'Volt Motors',
    title: 'EV Launch Film — "Charge the City"',
    description: 'A 45-second cinematic launch film for our new compact EV. We want a futuristic but grounded city at dusk, with the car as the hero.',
    contentType: 'Video',
    style: 'Cinematic',
    mood: 'Optimistic, electric',
    aspectRatio: '16:9',
    platform: ['YouTube', 'Advertising'],
    commercialUse: 'Full commercial rights',
    budget: '$8,000 – $12,000',
    startDate: '2026-10-20',
    deadline: '2026-11-15',
    requiredSkills: ['Cinematic Storytelling', 'Color Grading', 'Video Editing'],
    applicants: 14,
    status: 'open',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'b2',
    brandName: 'Maison Aure',
    title: 'Winter Couture Lookbook',
    description: 'Twenty editorial images for our winter couture collection. Garments must remain accurate — we will supply product photography.',
    contentType: 'Image',
    style: 'Editorial',
    mood: 'Moody, luxurious',
    aspectRatio: '4:5',
    platform: ['Instagram', 'Website'],
    commercialUse: 'Commercial',
    budget: '$4,000 – $6,000',
    startDate: '2026-10-15',
    deadline: '2026-11-05',
    requiredSkills: ['Fashion Editorial', 'LoRA Training', 'Upscaling & Retouching'],
    applicants: 9,
    status: 'open',
    createdAt: '2026-10-02T09:00:00.000Z',
  },
  {
    id: 'b3',
    brandName: 'Snackly',
    title: 'Animated Mascot TikTok Series',
    description: 'Six 15-second episodes starring our mascot "Crunch". Playful, fast hooks, native to TikTok.',
    contentType: 'Animation',
    style: 'Playful 3D cartoon',
    mood: 'Fun, energetic',
    aspectRatio: '9:16',
    platform: ['TikTok', 'Instagram'],
    commercialUse: 'Commercial',
    budget: '$2,500 – $4,000',
    startDate: '2026-10-12',
    deadline: '2026-10-30',
    requiredSkills: ['Character Design', 'Video Editing', 'Sound Design'],
    applicants: 21,
    status: 'open',
    createdAt: '2026-10-03T12:00:00.000Z',
  },
  {
    id: 'b4',
    brandName: 'Nimbus Audio',
    title: 'Product Hero Renders — Nimbus Pro',
    description: 'Hero 3D renders of our new earbuds in abstract environments for launch day across web and paid social.',
    contentType: '3D',
    style: 'Minimal abstract',
    mood: 'Premium, calm',
    aspectRatio: '1:1',
    platform: ['Website', 'Advertising'],
    commercialUse: 'Full commercial rights',
    budget: '$5,000 – $7,500',
    startDate: '2026-10-18',
    deadline: '2026-11-10',
    requiredSkills: ['3D Modeling', 'Lighting & Rendering', 'Product Visualization'],
    applicants: 7,
    status: 'open',
    createdAt: '2026-10-04T15:30:00.000Z',
  },
  {
    id: 'b5',
    brandName: 'Finly',
    title: 'Motion Identity Refresh',
    description: 'Animated logo, transitions and a kinetic type system for our rebrand. Must feel trustworthy yet modern.',
    contentType: 'Motion Graphics',
    style: 'Clean kinetic',
    mood: 'Confident',
    aspectRatio: '16:9',
    platform: ['Website', 'YouTube'],
    commercialUse: 'Full commercial rights',
    budget: '$6,000 – $9,000',
    startDate: '2026-10-25',
    deadline: '2026-12-01',
    requiredSkills: ['Brand Identity', 'Compositing', '3D Modeling'],
    applicants: 11,
    status: 'open',
    createdAt: '2026-10-05T08:00:00.000Z',
  },
  {
    id: 'b6',
    brandName: 'Echo Records',
    title: 'Album Visualizer — "Neon Tides"',
    description: 'A 3-minute audio-reactive visualizer for the lead single. Surreal, oceanic, bioluminescent.',
    contentType: 'Animation',
    style: 'Surreal generative',
    mood: 'Hypnotic',
    aspectRatio: '16:9',
    platform: ['YouTube'],
    commercialUse: 'Commercial',
    budget: '$3,000 – $5,000',
    startDate: '2026-10-14',
    deadline: '2026-11-08',
    requiredSkills: ['Worldbuilding', 'Prompt Engineering', 'Compositing'],
    applicants: 16,
    status: 'open',
    createdAt: '2026-10-05T18:00:00.000Z',
  },
  {
    id: 'b7',
    brandName: 'Terra Living',
    title: 'Lifestyle Imagery for Homeware Catalog',
    description: 'Forty photoreal lifestyle images placing our products in warm Scandinavian interiors.',
    contentType: 'Image',
    style: 'Photoreal lifestyle',
    mood: 'Warm, natural',
    aspectRatio: '4:5',
    platform: ['Website', 'Instagram'],
    commercialUse: 'Commercial',
    budget: '$3,500 – $5,500',
    startDate: '2026-10-16',
    deadline: '2026-11-20',
    requiredSkills: ['Product Visualization', 'Upscaling & Retouching', 'Prompt Engineering'],
    applicants: 12,
    status: 'open',
    createdAt: '2026-10-06T11:00:00.000Z',
  },
  {
    id: 'b8',
    brandName: 'Skyline Estates',
    title: 'Luxury Tower Walkthrough',
    description: 'A 60-second 3D walkthrough of our flagship residential tower, from lobby to rooftop at golden hour.',
    contentType: '3D',
    style: 'Architectural luxury',
    mood: 'Aspirational',
    aspectRatio: '16:9',
    platform: ['YouTube', 'Website', 'Advertising'],
    commercialUse: 'Full commercial rights',
    budget: '$10,000 – $15,000',
    startDate: '2026-11-01',
    deadline: '2026-12-15',
    requiredSkills: ['3D Modeling', 'Lighting & Rendering', 'Worldbuilding'],
    applicants: 5,
    status: 'open',
    createdAt: '2026-10-07T14:00:00.000Z',
  },
];

export const LOCATIONS = Array.from(new Set(CREATORS.map((c) => c.location))).sort();

export const DEMO_USERS = [
  { name: 'Northwind Studio', email: 'brand@cre8r.dev', password: 'password123', role: 'brand' as const },
  { name: 'Aarav Mehta', email: 'creator@cre8r.dev', password: 'password123', role: 'creator' as const, creatorId: 'aarav-mehta' },
];
