export class OrganizationValidators{

    static validateRegistrationNumber(registrationNumber: string): boolean{
        return /^[0-9]{8}$/.test(registrationNumber)
    }

    static validateTaxId(taxId: string): boolean{
        return /^[1-9][0-9]{8}$/.test(taxId)
    }
}