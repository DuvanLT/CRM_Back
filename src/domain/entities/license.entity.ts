export class License {
    constructor(
        public readonly id: string | null,
        public name: string,
        public maxUsers: number,
        public maxMessagesMonth: number,
        public maxCampaignsMonth: number,
        public maxStorageMb: number,
        public priceMonthly: number | null,
        public priceYearly: number | null,
        public readonly createdAt: Date
    ) { }

    static create(
        name: string,
        maxUsers: number,
        maxMessagesMonth: number,
        maxCampaignsMonth: number,
        maxStorageMb: number,
        priceMonthly?: number,
        priceYearly?: number
    ): License {
        return new License(
            null,
            name,
            maxUsers,
            maxMessagesMonth,
            maxCampaignsMonth,
            maxStorageMb,
            priceMonthly || null,
            priceYearly || null,
            new Date()
        );
    }

    isFree(): boolean {
        return this.priceMonthly === null && this.priceYearly === null;
    }

    canSupportUsers(userCount: number): boolean {
        return userCount <= this.maxUsers;
    }
}