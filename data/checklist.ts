export type Category = 'A' | 'B' | 'C';
export type Subcategory = 'Infrastructure' | 'Practices' | 'Awareness' | 'Innovations';

export type ChecklistItem = {
    id: string;
    category: Category;
    categoryLabel: string;
    subcategory: Subcategory;
    label: string;
    maxMarks: number;
    minMarks: number;
};

export const CHECKLIST: ChecklistItem[] = [
    // Category A — Faecal Sludge Management (80 marks)
    {
        id: 'A1',
        category: 'A',
        categoryLabel: 'Faecal Sludge Management',
        subcategory: 'Infrastructure',
        label: 'Flush/pour-flush toilets available with adequate coverage (all rooms & common areas)',
        maxMarks: 8,
        minMarks: 0,
    },
    {
        id: 'A2',
        category: 'A',
        categoryLabel: 'Faecal Sludge Management',
        subcategory: 'Infrastructure',
        label: 'Functional toilets for men, women & differently-abled — regularly cleaned & odourless',
        maxMarks: 8,
        minMarks: 0,
    },
    {
        id: 'A3',
        category: 'A',
        categoryLabel: 'Faecal Sludge Management',
        subcategory: 'Infrastructure',
        label: 'Containment unit type — septic tank / STP / single pit assessment',
        maxMarks: 22,
        minMarks: 0,
    },
    {
        id: 'A4',
        category: 'A',
        categoryLabel: 'Faecal Sludge Management',
        subcategory: 'Infrastructure',
        label: 'Mechanical desludging of septic tank done regularly as per standards',
        maxMarks: 10,
        minMarks: 0,
    },
    {
        id: 'A5',
        category: 'A',
        categoryLabel: 'Faecal Sludge Management',
        subcategory: 'Practices',
        label: 'Septic tank effluent NOT discharged to open drains — periodic cleaning maintained',
        maxMarks: 8,
        minMarks: 0,
    },
    {
        id: 'A6',
        category: 'A',
        categoryLabel: 'Faecal Sludge Management',
        subcategory: 'Awareness',
        label: 'Awareness posters on sanitation, septic tank maintenance & visual cleanliness visible',
        maxMarks: 8,
        minMarks: 0,
    },
    {
        id: 'A7',
        category: 'A',
        categoryLabel: 'Faecal Sludge Management',
        subcategory: 'Innovations',
        label: 'Innovative toilet/septic treatment method adopted',
        maxMarks: 16,
        minMarks: 0,
    },

    // Category B — Solid Waste Management (80 marks)
    {
        id: 'B1',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Infrastructure',
        label: 'Segregation bins (blue & green) in all rooms, common areas & staff quarters',
        maxMarks: 18,
        minMarks: 0,
    },
    {
        id: 'B2',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Infrastructure',
        label: 'Biodegradable waste treatment via composting or biogas unit',
        maxMarks: 10,
        minMarks: 0,
    },
    {
        id: 'B3',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Infrastructure',
        label: 'Menstrual/sanitary waste handled scientifically with incinerator or forward linkage',
        maxMarks: 6,
        minMarks: 0,
    },
    {
        id: 'B4',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Infrastructure',
        label: 'Plastic waste segregated and sent to PWMU/cement factories/sustainable linkage',
        maxMarks: 8,
        minMarks: 0,
    },
    {
        id: 'B5',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Infrastructure',
        label: 'Linkage with large waste processing and e-waste processing units',
        maxMarks: 6,
        minMarks: 0,
    },
    {
        id: 'B6',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Practices',
        label: 'Biomedical and e-waste segregated and handled separately as per norms',
        maxMarks: 2,
        minMarks: 0,
    },
    {
        id: 'B7',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Practices',
        label: 'No indiscriminate dumping, piling, or burning of any waste on premises',
        maxMarks: 2,
        minMarks: 0,
    },
    {
        id: 'B8',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Practices',
        label: 'Alternatives to single-use plastic actively promoted',
        maxMarks: 2,
        minMarks: 0,
    },
    {
        id: 'B9',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Practices',
        label: 'User charges to Gram Panchayat paid regularly',
        maxMarks: 2,
        minMarks: 0,
    },
    {
        id: 'B10',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Awareness',
        label: 'Awareness posters on waste segregation, no plastic, safe menstrual hygiene visible',
        maxMarks: 8,
        minMarks: 0,
    },
    {
        id: 'B11',
        category: 'B',
        categoryLabel: 'Solid Waste Management',
        subcategory: 'Innovations',
        label: 'Innovative solid waste management practice adopted',
        maxMarks: 16,
        minMarks: 0,
    },

    // Category C — Grey Water Management (40 marks)
    {
        id: 'C1',
        category: 'C',
        categoryLabel: 'Grey Water Management',
        subcategory: 'Infrastructure',
        label: 'Soak pit/leach pit/kitchen garden constructed for greywater management',
        maxMarks: 16,
        minMarks: 0,
    },
    {
        id: 'C2',
        category: 'C',
        categoryLabel: 'Grey Water Management',
        subcategory: 'Infrastructure',
        label: 'Measures to prevent water stagnation — drainage/rainwater harvesting/pump',
        maxMarks: 8,
        minMarks: 0,
    },
    {
        id: 'C3',
        category: 'C',
        categoryLabel: 'Grey Water Management',
        subcategory: 'Practices',
        label: 'Greywater NOT mixed with blackwater (except in piped sewer systems)',
        maxMarks: 2,
        minMarks: 0,
    },
    {
        id: 'C4',
        category: 'C',
        categoryLabel: 'Grey Water Management',
        subcategory: 'Practices',
        label: 'Treated wastewater recycled for landscaping or flushing (non-potable reuse)',
        maxMarks: 2,
        minMarks: 0,
    },
    {
        id: 'C5',
        category: 'C',
        categoryLabel: 'Grey Water Management',
        subcategory: 'Awareness',
        label: 'Posters on water conservation, towel reuse, and greywater recharge visible',
        maxMarks: 4,
        minMarks: 0,
    },
    {
        id: 'C6',
        category: 'C',
        categoryLabel: 'Grey Water Management',
        subcategory: 'Innovations',
        label: 'Innovative greywater management — ZLD, treated reuse system, water recycling',
        maxMarks: 8,
        minMarks: 0,
    },
];

export const CATEGORY_MAX: Record<Category, number> = {
    A: 80,
    B: 80,
    C: 40,
};

export const CATEGORY_LABELS: Record<Category, string> = {
    A: 'Faecal Sludge Management',
    B: 'Solid Waste Management',
    C: 'Grey Water Management',
};