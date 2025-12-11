export type PlanType = 'free' | 'pro' | 'pro_plus'

export const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        stripeIds: {
            monthly: null,
            annual: null,
        },
        limits: {
            scripts: 3,
            mockups: 0,
            videos: 0,
        },
        features: {
            viewAllObjections: false,
            productMemory: false,
            mockups: false,
            videos: false,
        },
    },
    pro: {
        name: 'Pro',
        price: 1990, // in cents
        stripeIds: {
            monthly: 'price_1SczF1GUezyhsX2w30KyuFL5',
            annual: 'price_1SczF1GUezyhsX2wrpjTsyG7',
        },
        limits: {
            scripts: 20,
            mockups: 0,
            videos: 0,
        },
        features: {
            viewAllObjections: true,
            productMemory: true,
            mockups: false,
            videos: false,
        },
    },
    pro_plus: {
        name: 'Pro+',
        price: 5990, // in cents
        stripeIds: {
            monthly: 'price_1SczF1GUezyhsX2w2ij4NUPd',
            annual: 'price_1SczF1GUezyhsX2wenYxn8No',
        },
        limits: {
            scripts: 20,
            mockups: 10,
            videos: 3,
        },
        features: {
            viewAllObjections: true,
            productMemory: true,
            mockups: true,
            videos: true,
        },
    },
} as const

export function getPlanDetails(plan: string) {
    return PLANS[plan as PlanType] || PLANS.free
}
