import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export type UserPlan = 'free' | 'pro' | 'pro_plus';

export function useSubscription() {
    const [plan, setPlan] = useState<UserPlan>('free');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('plano_atual')
                    .eq('id', user.id)
                    .single();

                if (data?.plano_atual) {
                    setPlan(data.plano_atual as UserPlan);
                }
            }
            setLoading(false);
        };

        fetchPlan();
    }, []);

    return { plan, loading };
}
