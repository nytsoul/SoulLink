export interface UserProfile {
    id: string;
    name: string;
    dob: string;
    email: string;
    phone: string;
    gender?: string;
    pronouns?: string;
    location?: string;
    bio?: string;
    interests: string[];
    profile_photos: string[];
    mode_default: 'love' | 'friends';
    mode_locked: boolean;
    wallet_address?: string;
    private_mode: boolean;
    is_phone_verified: boolean;
    two_factor_enabled: boolean;
    created_at: string;
    updated_at: string;
}
