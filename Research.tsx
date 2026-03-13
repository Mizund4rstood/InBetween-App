import { useState, useMemo } from 'react';
import { ExternalLink, BookOpen, Brain, Heart, Wind, Leaf, PenLine, Zap, Eye, Search, X } from 'lucide-react';

interface Study {
  title: string;
  authors: string;
  journal: string;
  year: number;
  summary: string;
  doi?: string;
  url?: string;
}

interface Category {
  key: string;
  label: string;
  icon: React.ReactNode;
  bgClass: string;
  studies: Study[];
}

const categories: Category[] = [
  {
    key: 'gratitude',
    label: 'Gratitude',
    icon: <Heart className="w-4 h-4 text-primary" />,
    bgClass: 'bg-primary/10',
    studies: [
      {
        title: 'Counting Blessings Versus Burdens: An Experimental Investigation of Gratitude and Subjective Well-Being in Daily Life',
        authors: 'Emmons, R. A., & McCullough, M. E.',
        journal: 'Journal of Personality and Social Psychology',
        year: 2003,
        summary: 'Participants who kept weekly gratitude journals exercised more, had fewer physical complaints, and felt better about their lives overall compared to those who recorded hassles or neutral events.',
        doi: '10.1037/0022-3514.84.2.377',
      },
      {
        title: 'Gratitude and Well-Being: A Review and Theoretical Integration',
        authors: 'Wood, A. M., Froh, J. J., & Geraghty, A. W. A.',
        journal: 'Clinical Psychology Review',
        year: 2010,
        summary: 'A comprehensive review showing gratitude uniquely predicts satisfaction with life, and is associated with better sleep, lower depression, and higher resilience.',
        doi: '10.1016/j.cpr.2010.03.005',
      },
      {
        title: 'A Grateful Heart is a Nonviolent Heart: Cross-Sectional, Experience Sampling, Longitudinal, and Experimental Evidence',
        authors: 'DeWall, C. N., Lambert, N. M., et al.',
        journal: 'Social Psychological and Personality Science',
        year: 2012,
        summary: 'Gratitude reduces aggression and increases empathy and prosocial behavior, even when provoked by others.',
        doi: '10.1177/1948550611416675',
      },
    ],
  },
  {
    key: 'grounding',
    label: 'Grounding',
    icon: <Wind className="w-4 h-4 text-accent" />,
    bgClass: 'bg-accent/20',
    studies: [
      {
        title: 'The Effect of Diaphragmatic Breathing on Attention, Negative Affect and Stress in Healthy Adults',
        authors: 'Ma, X., Yue, Z. Q., Gong, Z. Q., et al.',
        journal: 'Frontiers in Psychology',
        year: 2017,
        summary: 'Controlled breathing significantly reduces cortisol levels, improves sustained attention, and decreases negative affect.',
        doi: '10.3389/fpsyg.2017.00874',
      },
      {
        title: 'Brief Structured Respiration Practices Enhance Mood and Reduce Physiological Arousal',
        authors: 'Balban, M. Y., Neri, E., Kogon, M. M., et al.',
        journal: 'Cell Reports Medicine',
        year: 2023,
        summary: 'Stanford study found that just 5 minutes of daily breathwork (cyclic sighing) improved mood and reduced anxiety more effectively than mindfulness meditation.',
        doi: '10.1016/j.xcrm.2022.100895',
      },
      {
        title: 'Grounding Techniques in the Treatment of Panic Symptoms',
        authors: 'Najavits, L. M.',
        journal: 'Clinical Psychology: Science and Practice',
        year: 2002,
        summary: 'Sensory grounding (like the 5-4-3-2-1 technique) effectively interrupts dissociation and panic by redirecting attention to the present moment.',
        url: 'https://doi.org/10.1093/clipsy.9.4.374',
      },
    ],
  },
  {
    key: 'wellbeing',
    label: 'Well-Being',
    icon: <Brain className="w-4 h-4 text-primary" />,
    bgClass: 'bg-primary/10',
    studies: [
      {
        title: 'Positive Psychology Progress: Empirical Validation of Interventions',
        authors: 'Seligman, M. E. P., Steen, T. A., Park, N., & Peterson, C.',
        journal: 'American Psychologist',
        year: 2005,
        summary: 'Writing three good things daily for one week increased happiness and strengthened emotional regulation for up to six months \u2014 one of the most replicated findings in positive psychology.',
        doi: '10.1037/0003-066X.60.5.410',
      },
      {
        title: 'The Role of Gratitude in Spiritual Well-Being in Asymptomatic Heart Failure Patients',
        authors: 'Mills, P. J., Redwine, L., Wilson, K., et al.',
        journal: 'Spirituality in Clinical Practice',
        year: 2015,
        summary: 'Grateful heart failure patients showed better sleep, less fatigue, lower inflammation, and improved cardiac biomarkers.',
        doi: '10.1037/scp0000050',
      },
    ],
  },
  {
    key: 'mindfulness',
    label: 'Mindfulness',
    icon: <Eye className="w-4 h-4 text-accent" />,
    bgClass: 'bg-accent/15',
    studies: [
      {
        title: 'Mindfulness-Based Stress Reduction and Health Benefits: A Meta-Analysis',
        authors: 'Grossman, P., Niemann, L., Schmidt, S., & Walach, H.',
        journal: 'Journal of Psychosomatic Research',
        year: 2004,
        summary: 'Meta-analysis of 20 studies showing MBSR consistently improves mental health, pain management, and overall quality of life across diverse populations.',
        doi: '10.1016/S0022-3999(03)00573-7',
      },
      {
        title: 'Alterations in Brain and Immune Function Produced by Mindfulness Meditation',
        authors: 'Davidson, R. J., Kabat-Zinn, J., et al.',
        journal: 'Psychosomatic Medicine',
        year: 2003,
        summary: 'Eight weeks of mindfulness meditation increased left-sided anterior brain activation (associated with positive affect) and boosted immune response to flu vaccine.',
        doi: '10.1097/01.PSY.0000077505.67574.E3',
      },
      {
        title: 'Effect of Mindfulness-Based Stress Reduction vs Cognitive Behavioral Therapy on Social Anxiety',
        authors: 'Goldin, P. R., Morrison, A., Jazaieri, H., et al.',
        journal: 'JAMA Psychiatry',
        year: 2016,
        summary: 'MBSR was as effective as CBT for treating social anxiety disorder, with lasting improvements in self-views and emotion regulation.',
        doi: '10.1001/jamapsychiatry.2016.1066',
      },
    ],
  },
  {
    key: 'journaling',
    label: 'Journaling',
    icon: <PenLine className="w-4 h-4 text-primary" />,
    bgClass: 'bg-primary/10',
    studies: [
      {
        title: 'Expressive Writing in Psychological Science',
        authors: 'Pennebaker, J. W.',
        journal: 'Perspectives on Psychological Science',
        year: 2018,
        summary: 'Decades of research confirm that writing about emotional experiences for 15–20 minutes improves physical health, immune function, and psychological well-being.',
        doi: '10.1177/1745691617707315',
      },
      {
        title: 'Online Positive Affect Journaling in the Improvement of Mental Distress and Well-Being',
        authors: 'Smyth, J. M., Johnson, J. A., Auer, B. J., et al.',
        journal: 'JMIR Mental Health',
        year: 2018,
        summary: 'Participants who journaled about positive experiences for 12 weeks showed decreased anxiety, reduced perceived stress, and greater resilience.',
        doi: '10.2196/mental.11290',
      },
      {
        title: 'Emotional and Physical Health Benefits of Expressive Writing',
        authors: 'Baikie, K. A., & Wilhelm, K.',
        journal: 'Advances in Psychiatric Treatment',
        year: 2005,
        summary: 'Expressive writing reduces doctor visits, improves immune function, and lowers blood pressure — effects lasting months after just 3–5 writing sessions.',
        doi: '10.1192/apt.11.5.338',
      },
    ],
  },
  {
    key: 'neuroplasticity',
    label: 'Neuroplasticity',
    icon: <Zap className="w-4 h-4 text-accent" />,
    bgClass: 'bg-accent/20',
    studies: [
      {
        title: 'The Structure and Function of the Human Brain Are Changed by Meditation',
        authors: 'Lazar, S. W., Kerr, C. E., Wasserman, R. H., et al.',
        journal: 'NeuroReport',
        year: 2005,
        summary: 'Long-term meditators had increased cortical thickness in brain regions associated with attention, interoception, and sensory processing.',
        doi: '10.1097/01.wnr.0000186598.66243.19',
      },
      {
        title: 'Mindfulness Practice Leads to Increases in Regional Brain Gray Matter Density',
        authors: 'Hölzel, B. K., Carmody, J., Vangel, M., et al.',
        journal: 'Psychiatry Research: Neuroimaging',
        year: 2011,
        summary: 'Just 8 weeks of mindfulness practice increased gray matter in the hippocampus (learning/memory) and decreased it in the amygdala (stress/anxiety).',
        doi: '10.1016/j.pscychresns.2010.08.006',
      },
      {
        title: 'The Neuroscience of Gratitude and Effects on the Brain',
        authors: 'Kini, P., Wong, J., McInnis, S., et al.',
        journal: 'NeuroImage',
        year: 2016,
        summary: 'Gratitude writing activated medial prefrontal cortex regions linked to learning and decision-making — and the neural benefits increased over time, suggesting lasting brain changes.',
        doi: '10.1016/j.neuroimage.2015.10.042',
      },
    ],
  },
  {
    key: 'self-compassion',
    label: 'Self-Compassion',
    icon: <Leaf className="w-4 h-4 text-primary" />,
    bgClass: 'bg-primary/10',
    studies: [
      {
        title: 'Self-Compassion: An Alternative Conceptualization of a Healthy Attitude Toward Oneself',
        authors: 'Neff, K. D.',
        journal: 'Self and Identity',
        year: 2003,
        summary: 'Foundational paper defining self-compassion as self-kindness, common humanity, and mindfulness — shown to predict emotional resilience and lower anxiety.',
        doi: '10.1080/15298860309032',
      },
      {
        title: 'Does Self-Compassion Mitigate the Relationship Between Burnout and Barriers to Compassion?',
        authors: 'Beaumont, E., Durkin, M., Hollins Martin, C. J., & Carson, J.',
        journal: 'Counselling and Psychotherapy Research',
        year: 2016,
        summary: 'Higher self-compassion significantly reduced burnout and compassion fatigue in healthcare workers, suggesting it as a protective psychological resource.',
        doi: '10.1002/capr.12068',
      },
    ],
  },
];

function StudyCard({ study }: { study: Study }) {
  const link = study.doi ? `https://doi.org/${study.doi}` : study.url;

  return (
    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-2">
      <h3 className="font-semibold text-sm leading-snug">{study.title}</h3>
      <p className="text-xs text-muted-foreground">{study.authors}</p>
      <p className="text-xs text-muted-foreground italic">
        {study.journal}, {study.year}
      </p>
      <p className="text-sm text-foreground/80 leading-relaxed">{study.summary}</p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-1"
        >
          View source <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

export default function ResearchPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return categories
      .filter(cat => !activeFilter || cat.key === activeFilter)
      .map(cat => ({
        ...cat,
        studies: q
          ? cat.studies.filter(
              s =>
                s.title.toLowerCase().includes(q) ||
                s.authors.toLowerCase().includes(q) ||
                s.summary.toLowerCase().includes(q) ||
                s.journal.toLowerCase().includes(q)
            )
          : cat.studies,
      }))
      .filter(cat => cat.studies.length > 0);
  }, [search, activeFilter]);

  const totalShown = filtered.reduce((n, c) => n + c.studies.length, 0);

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-4">
        <h1 className="text-3xl font-serif font-bold">The Science</h1>
        <p className="text-muted-foreground mt-1 text-sm">Research-backed evidence for gratitude &amp; grounding practices</p>
      </div>

      {/* Intro paragraph */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-sage-light/40 via-card to-card border border-primary/10 mb-5 shadow-[var(--shadow-card)]">
        <p className="text-sm leading-relaxed text-foreground/85">
          Gratitude can be as simple as being thankful for food on your table, the warmth of sunlight,
          or a stranger's smile — or as profound and complex as meeting the love of your life, overcoming
          a hardship that once felt impossible, or reconnecting with someone you thought you'd lost forever.
          No act of gratitude is too small or too grand. Science shows that recognizing what we have —
          at any scale — rewires our brains for resilience, calm, and joy.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search studies by topic, author, or keyword…"
          className="w-full pl-10 pr-9 py-3 rounded-2xl bg-card border border-border/50 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-[var(--shadow-card)]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            !activeFilter
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveFilter(activeFilter === cat.key ? null : cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === cat.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count when filtering */}
      {(search || activeFilter) && (
        <p className="text-xs text-muted-foreground mb-4">
          {totalShown} stud{totalShown !== 1 ? 'ies' : 'y'} found
          {search && <> for "<span className="font-semibold text-foreground">{search}</span>"</>}
        </p>
      )}

      {/* Categories & studies */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No studies match your search.</p>
          <button
            onClick={() => { setSearch(''); setActiveFilter(null); }}
            className="text-xs text-primary font-semibold mt-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        filtered.map(cat => (
          <section key={cat.key} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${cat.bgClass}`}>
                {cat.icon}
              </div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{cat.label}</h2>
              <span className="text-[10px] text-muted-foreground/60 ml-auto">{cat.studies.length}</span>
            </div>
            <div className="space-y-3">
              {cat.studies.map((s, i) => <StudyCard key={i} study={s} />)}
            </div>
          </section>
        ))
      )}

      <div className="text-center pb-6">
        <div className="p-1.5 rounded-lg bg-primary/10 inline-flex mb-2">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground">
          All citations link to peer-reviewed journals. This app is a wellness tool, not medical advice.
        </p>
      </div>
    </div>
  );
}
