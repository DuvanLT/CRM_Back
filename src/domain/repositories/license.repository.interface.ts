import type { License } from "../entities/license.entity.js";

export interface ILicenseRepository {
    findById(id: string): Promise<License | null>;
    findByName(name: string): Promise<License | null>;
}