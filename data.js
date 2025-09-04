const coachesData = [
    {
        id: 'c001',
        name: 'Alex Johnson',
        avatarUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        specialty: 'Strength & Conditioning',
        rating: '4.7 (82 reviews)',
        bio: 'Certified strength coach with over 10 years of experience helping athletes reach their peak performance. My philosophy combines traditional strength training with functional movements for real-world results.',
        offerings: [
            { type: 'One-Time', title: 'Single Session Consultation', price: 25, description: 'A 60-minute one-on-one session to review your form, discuss your goals, or create a mini-plan.' },
            { type: 'Subscription', title: 'Monthly Coaching', price: 80, duration: 'month', description: 'Weekly check-ins, personalized plan adjustments, and priority support via chat.', isPopular: true },
            { type: 'Subscription', title: '3-Month Transformation', price: 220, duration: '3 months', description: 'A complete package with bi-weekly video calls and a fully customized nutrition and workout plan.' }
        ],
        sellsPrograms: ['p002'],
        stats: {
            experience: '10+',
            clients: '250+',
            certifications: 5
        },
        testimonials: [
            {
                quote: "Lost 20lbs and gained so much confidence. Alex's programming is top-notch!",
                name: 'Sarah L.',
                beforeImageUrl: 'https://placehold.co/200x200/cccccc/999999?text=Before',
                afterImageUrl: 'https://placehold.co/200x200/ec4899/ffffff?text=After'
            }
        ],
        certifications: [
            'NASM Certified Personal Trainer',
            'Strength & Conditioning Specialist (CSCS)',
            'Precision Nutrition Level 1',
            'Functional Movement Screen (FMS)',
            'Kettlebell Athletics Level 2'
        ]
    },
    {
        id: 'c002',
        name: 'Chloe Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        specialty: 'Yoga & Mindfulness',
        rating: '4.8 (112 reviews)',
        bio: 'Yoga Alliance certified instructor focusing on Vinyasa flows and mindfulness. My goal is to help you connect your mind and body, building strength and flexibility both on and off the mat.',
        offerings: [
            { type: 'One-Time', title: 'Private Yoga Session', price: 22, description: 'A 75-minute personalized yoga session tailored to your skill level and goals.' },
            { type: 'Subscription', title: 'Monthly Yoga Pass', price: 75, duration: 'month', description: 'Access to all live-streamed classes and a weekly guided meditation.', isPopular: true }
        ],
        sellsPrograms: ['p003'],
        stats: {
            experience: '6+',
            clients: '500+',
            certifications: 3
        },
        testimonials: [
            {
                quote: "Her classes are my weekly reset button. I've never felt more flexible and calm.",
                name: 'Emily R.',
                beforeImageUrl: 'https://placehold.co/200x200/cccccc/999999?text=Before',
                afterImageUrl: 'https://placehold.co/200x200/d946ef/ffffff?text=After'
            }
        ],
        certifications: [
            'E-RYT 500 Yoga Alliance',
            'Certified Yin Yoga Instructor',
            'Prenatal Yoga Certified'
        ]
    },
    {
        id: 'c003',
        name: 'Maria Garcia',
        avatarUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        specialty: 'Certified Nutritionist',
        rating: '4.9 (150 reviews)',
        bio: 'A certified nutritionist dedicated to creating sustainable, science-based eating plans. No fad diets, just a healthy relationship with food to fuel your life and your workouts.',
        offerings: [
            { type: 'One-Time', title: 'Dietary Analysis', price: 30, description: 'A complete analysis of your current diet with actionable recommendations.' },
            { type: 'Subscription', title: 'Monthly Nutrition Plan', price: 90, duration: 'month', description: 'A personalized meal plan, updated weekly, with full support.', isPopular: true }
        ],
        sellsPrograms: [],
        stats: {
            experience: '8+',
            clients: '400+',
            certifications: 4
        },
        testimonials: [
            {
                quote: "Maria completely changed my relationship with food for the better. I have more energy than ever!",
                name: 'David K.',
                beforeImageUrl: 'https://placehold.co/200x200/cccccc/999999?text=Before',
                afterImageUrl: 'https://placehold.co/200x200/f472b6/ffffff?text=After'
            }
        ],
        certifications: [
            'Registered Dietitian Nutritionist (RDN)',
            'Certified Nutrition Specialist (CNS)',
            'Sports Nutritionist Certification',
            'Holistic Nutrition Certified'
        ]
    }
];


const programsData = [
    {
        id: 'p001',
        title: 'Booty Builder 101',
        author: 'By Jen Selter',
        price: 9,
        equipment: 'minimal',
        image: 'https://placehold.co/400x200/fce7f3/be185d?text=Booty+Builder',
        duration: '4 Weeks',
        description: 'A comprehensive 4-week program designed to build and strengthen your glutes with minimal equipment. Perfect for home workouts.',
        videoUrl: 'https://www.youtube.com/embed/NpEaa2P7qZI',
        frequency: '4x / week',
        goals: 'Glutes',
        suitableFor: 'Beginner',
        purchaseCount: '1,289',
        rating: 4.9,
        includes: ['Workout Program', 'Video Guides', 'Community Group'],
        plan: [
            {
                week: 1,
                days: [
                    { day: 1, title: 'Glute Focus A', exercises: [
                        { name: 'Goblet Squat', setsReps: '3 sets x 12 reps', videoUrl: 'https://www.youtube.com/embed/k9FW5y8_sA4' },
                        { name: 'Glute Bridge', setsReps: '3 sets x 15 reps', videoUrl: 'https://www.youtube.com/embed/w-M32GDb_Qc' },
                        { name: 'Fire Hydrants', setsReps: '3 sets x 20 reps (each side)', videoUrl: 'https://www.youtube.com/embed/V2V9_J0hKxY' }
                    ]},
                    { day: 2, title: 'Upper Body & Core', exercises: [
                        { name: 'Push Ups (on knees)', setsReps: '3 sets x max reps', videoUrl: 'https://www.youtube.com/embed/8H2hN_as_yU' },
                        { name: 'Plank', setsReps: '3 sets x 45 seconds', videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c' },
                        { name: 'Bird Dog', setsReps: '3 sets x 12 reps (each side)', videoUrl: 'https://www.youtube.com/embed/wiFNA3sqj84' }
                    ]},
                    { day: 3, title: 'Rest Day', exercises: [] },
                    { day: 4, title: 'Glute Focus B', exercises: [
                        { name: 'Dumbbell Lunges', setsReps: '3 sets x 10 reps (each leg)', videoUrl: 'https://www.youtube.com/embed/D7Ka_0Vn1sg' },
                        { name: 'Romanian Deadlift (RDL)', setsReps: '3 sets x 12 reps', videoUrl: 'https://www.youtube.com/embed/JCX_g_Zl_Y4' },
                        { name: 'Donkey Kicks', setsReps: '3 sets x 20 reps (each side)', videoUrl: 'https://www.youtube.com/embed/M1_3o13639Q' }
                    ]},
                    { day: 5, title: 'Active Recovery', exercises: [] },
                    { day: 6, title: 'Full Body Light', exercises: [
                         { name: 'Bodyweight Squats', setsReps: '3 sets x 20 reps', videoUrl: 'https://www.youtube.com/embed/xqvCmoLULNY' },
                         { name: 'Jumping Jacks', setsReps: '3 sets x 60 seconds', videoUrl: 'https://www.youtube.com/embed/iSSAk4XCsRA' }
                    ]},
                    { day: 7, title: 'Rest Day', exercises: [] }
                ]
            },
            {
                week: 2,
                days: [
                    { day: 1, title: 'Glute Focus A (Progression)', exercises: [
                        { name: 'Goblet Squat', setsReps: '4 sets x 12 reps', videoUrl: 'https://www.youtube.com/embed/k9FW5y8_sA4' },
                        { name: 'Glute Bridge', setsReps: '4 sets x 15 reps', videoUrl: 'https://www.youtube.com/embed/w-M32GDb_Qc' },
                        { name: 'Fire Hydrants', setsReps: '4 sets x 20 reps (each side)', videoUrl: 'https://www.youtube.com/embed/V2V9_J0hKxY' }
                    ]},
                    { day: 2, title: 'Upper Body & Core', exercises: [
                        { name: 'Push Ups (on knees)', setsReps: '4 sets x max reps', videoUrl: 'https://www.youtube.com/embed/8H2hN_as_yU' },
                        { name: 'Plank', setsReps: '3 sets x 60 seconds', videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c' },
                        { name: 'Bird Dog', setsReps: '4 sets x 12 reps (each side)', videoUrl: 'https://www.youtube.com/embed/wiFNA3sqj84' }
                    ]},
                    { day: 3, title: 'Rest Day', exercises: [] },
                    { day: 4, title: 'Glute Focus B (Progression)', exercises: [
                        { name: 'Dumbbell Lunges', setsReps: '4 sets x 10 reps (each leg)', videoUrl: 'https://www.youtube.com/embed/D7Ka_0Vn1sg' },
                        { name: 'Romanian Deadlift (RDL)', setsReps: '4 sets x 12 reps', videoUrl: 'https://www.youtube.com/embed/JCX_g_Zl_Y4' },
                        { name: 'Donkey Kicks', setsReps: '4 sets x 20 reps (each side)', videoUrl: 'https://www.youtube.com/embed/M1_3o13639Q' }
                    ]},
                    { day: 5, title: 'Active Recovery', exercises: [] },
                    { day: 6, title: 'Full Body Light', exercises: [
                         { name: 'Bodyweight Squats', setsReps: '4 sets x 20 reps', videoUrl: 'https://www.youtube.com/embed/xqvCmoLULNY' },
                         { name: 'Jumping Jacks', setsReps: '4 sets x 60 seconds', videoUrl: 'https://www.youtube.com/embed/iSSAk4XCsRA' }
                    ]},
                    { day: 7, title: 'Rest Day', exercises: [] }
                ]
            },
            // Weeks 3 and 4 would follow a similar progressive overload pattern
            { week: 3, days: [ { day: 1, title: 'Week 3 starts...', exercises: [] } ] },
            { week: 4, days: [ { day: 1, title: 'Final Week!', exercises: [] } ] }
        ]
    },
    {
        id: 'p002',
        title: 'Functional Full Body',
        author: 'By Dave Spitz',
        price: 15,
        equipment: 'full_gym',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        duration: '6 Weeks',
        description: 'This 6-week program focuses on functional strength, improving your performance in and out of the gym. Requires full gym access.',
        videoUrl: 'https://www.youtube.com/embed/7TcNt4o_2I',
        frequency: '3x / week',
        goals: 'Strength',
        suitableFor: 'Intermediate',
        purchaseCount: '2,405',
        rating: 4.8,
        includes: ['Workout Program', 'Video Guides', 'Community Group'],
        plan: [
            {
                week: 1,
                days: [
                    { day: 1, title: 'Full Body A', exercises: [
                        { name: 'Barbell Squat', setsReps: '3 sets x 8 reps', videoUrl: 'https://www.youtube.com/embed/C_VtOYc6j5c' },
                        { name: 'Bench Press', setsReps: '3 sets x 8 reps', videoUrl: 'https://www.youtube.com/embed/gRVjAtPip0Y' },
                        { name: 'Bent Over Row', setsReps: '3 sets x 10 reps', videoUrl: 'https://www.youtube.com/embed/vT2GjY_Umpw' }
                    ]},
                    { day: 2, title: 'Rest Day', exercises: [] },
                    { day: 3, title: 'Full Body B', exercises: [
                        { name: 'Deadlift', setsReps: '3 sets x 5 reps', videoUrl: 'https://www.youtube.com/embed/ytGaGIn3SjE' },
                        { name: 'Overhead Press', setsReps: '3 sets x 8 reps', videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI' },
                        { name: 'Pull Ups / Lat Pulldown', setsReps: '3 sets x max reps', videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g' }
                    ]},
                    { day: 4, title: 'Rest Day', exercises: [] },
                    { day: 5, title: 'Full Body C', exercises: [
                        { name: 'Leg Press', setsReps: '3 sets x 12 reps', videoUrl: 'https://www.youtube.com/embed/s8-83C3b2aI' },
                        { name: 'Dumbbell Incline Press', setsReps: '3 sets x 10 reps', videoUrl: 'https://www.youtube.com/embed/0G2_XV7slIg' },
                        { name: 'Seated Cable Row', setsReps: '3 sets x 12 reps', videoUrl: 'https://www.youtube.com/embed/GZbfZ033f74' }
                    ]},
                    { day: 6, title: 'Rest Day', exercises: [] },
                    { day: 7, title: 'Rest Day', exercises: [] }
                ]
            },
             // Weeks 2-6 would repeat the A/B/C split with progressive overload
            { week: 2, days: [ { day: 1, title: 'Week 2 - Increase Weight', exercises: [] } ] },
            { week: 3, days: [ { day: 1, title: 'Week 3 - Focus on Form', exercises: [] } ] },
            { week: 4, days: [ { day: 1, title: 'Week 4 - Keep Pushing', exercises: [] } ] },
            { week: 5, days: [ { day: 1, title: 'Week 5 - Almost There', exercises: [] } ] },
            { week: 6, days: [ { day: 1, title: 'Final Week!', exercises: [] } ] }
        ]
    },
    {
        id: 'p003',
        title: 'Morning Yoga Flow',
        author: 'By Chloe Chen',
        price: 18,
        equipment: 'minimal',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        duration: 'Subscription',
        description: 'Start your day with a revitalizing yoga flow. This subscription gives you access to a new session every morning to build flexibility and mindfulness.',
        videoUrl: 'https://www.youtube.com/embed/Eml2xnoLpYE',
        frequency: 'Daily',
        goals: 'Flexibility',
        suitableFor: 'All Levels',
        purchaseCount: '982',
        rating: 4.9,
        includes: ['Workout Program', 'Video Guides'],
        plan: [
            {
                week: 1,
                days: [
                    { day: 1, title: 'Energizing Morning Flow', exercises: [ { name: '15 Min Vinyasa Flow', setsReps: 'Follow along', videoUrl: 'https://www.youtube.com/embed/4pLUleL5QG4' } ] },
                    { day: 2, title: 'Gentle Stretches', exercises: [ { name: '10 Min Full Body Stretch', setsReps: 'Follow along', videoUrl: 'https://www.youtube.com/embed/PhY__qf_tQ4' } ] },
                    { day: 3, title: 'Core Strength Yoga', exercises: [ { name: '20 Min Core Yoga', setsReps: 'Follow along', videoUrl: 'https://www.youtube.com/embed/iA-b35a5-3g' } ] },
                    { day: 4, title: 'Hip Opening Flow', exercises: [ { name: '15 Min Yoga for Hips', setsReps: 'Follow along', videoUrl: 'https://www.youtube.com/embed/4k9n_3y4B0A' } ] },
                    { day: 5, title: 'Power Yoga', exercises: [ { name: '30 Min Power Vinyasa', setsReps: 'Follow along', videoUrl: 'https://www.youtube.com/embed/h3dFkIbfvJc' } ] },
                    { day: 6, title: 'Restorative Yoga', exercises: [ { name: '20 Min Restorative Yoga', setsReps: 'Follow along', videoUrl: 'https://www.youtube.com/embed/BiG_q4Y_frs' } ] },
                    { day: 7, title: 'Mindful Meditation', exercises: [ { name: '10 Min Guided Meditation', setsReps: 'Follow along', videoUrl: 'https://www.youtube.com/embed/O-6f5wQXSu8' } ] }
                ]
            },
            { week: 2, days: [ { day: 1, title: 'Week 2 - Deeper Poses', exercises: [] } ] },
            { week: 3, days: [ { day: 1, title: 'Week 3 - Focus on Breath', exercises: [] } ] },
            { week: 4, days: [ { day: 1, title: 'Week 4 - Finding Flow', exercises: [] } ] }
        ]
    }
];