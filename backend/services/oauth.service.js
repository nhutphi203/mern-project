
class OAuthService {

    /**
     * Liên kết tài khoản truyền thống với social account
     */
    static async linkSocialAccount(existingUser, socialProfile, provider) {
        try {
            // Cập nhật thông tin social login
            existingUser.authType = provider;
            existingUser.providerId = socialProfile.id;
            existingUser.isVerified = true;

            // Cập nhật avatar nếu có
            if (socialProfile.photos && socialProfile.photos.length > 0) {
                existingUser.avatar = socialProfile.photos[0].value;
            }

            await existingUser.save();
            return existingUser;
        } catch (error) {
            throw new Error(`Failed to link ${provider} account: ${error.message}`);
        }
    }

    /**
     * Tạo user mới từ social profile với validation
     */
    static async createSocialUser(profile, provider) {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
            throw new Error(`No email provided by ${provider}`);
        }

        // Tạo unique username từ email nếu không có tên
        const firstName = profile.name?.givenName || email.split('@')[0];
        const lastName = profile.name?.familyName || 'User';

        const userData = {
            firstName,
            lastName,
            email,
            authType: provider,
            providerId: profile.id,
            role: 'Patient',
            isVerified: true,
            avatar: profile.photos?.[0]?.value,
            // Placeholder values - user sẽ cần cập nhật sau
            phone: '0000000000',
            nic: '000000000000',
            dob: new Date('1990-01-01'),
            gender: 'Other'
        };

        const { User } = await import('../models/userScheme.js');
        return await User.create(userData);
    }

    /**
     * Xử lý multiple social providers cho cùng 1 user
     */
    static async handleMultipleProviders(email, newProfile, newProvider) {
        const { User } = await import('../models/userScheme.js');

        // Tìm user với email này
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return await this.createSocialUser(newProfile, newProvider);
        }

        // Nếu user đã có social login khác, cho phép add thêm provider
        if (existingUser.authType !== 'traditional') {
            // Có thể lưu multiple providers trong array (nâng cao)
            existingUser.authType = newProvider;
            existingUser.providerId = newProfile.id;
            await existingUser.save();
            return existingUser;
        }

        // Link với tài khoản truyền thống
        return await this.linkSocialAccount(existingUser, newProfile, newProvider);
    }

    /**
     * Validate và clean social profile data
     */
    static cleanProfileData(profile, provider) {
        const cleaned = {
            id: profile.id,
            emails: profile.emails || [],
            name: {
                givenName: profile.name?.givenName || '',
                familyName: profile.name?.familyName || ''
            },
            photos: profile.photos || []
        };

        // Provider-specific cleaning
        switch (provider) {
            case 'google':
                // Google-specific validation
                break;
            case 'facebook':
                // Facebook-specific validation
                break;
            case 'github':
                // GitHub may not have real name
                if (!cleaned.name.givenName && profile.username) {
                    cleaned.name.givenName = profile.username;
                }
                break;
        }

        return cleaned;
    }
}

export { OAuthService };