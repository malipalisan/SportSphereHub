export class AuthValidators{
    static validatePassword(password: string): boolean{
        if(!password) return false;

        const startsWithLetter = /^[A-Za-z]/.test(password)
        const validLength = password.length >= 8 && password.length <= 12
        const hasUppercase = /[A-Z]/.test(password)
        const hasDigit = /[0-9]/.test(password)
        const hasSpecial = /[^A-Za-z0-9]/.test(password)

        return startsWithLetter && validLength && hasUppercase && hasDigit && hasSpecial
    }

    static validateEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    static validateUsername(username: string): boolean{
        return username.length >= 3 && username.length <= 20
    }

    static validateFavoriteSports(favoriteSports: string[]): boolean {
        return favoriteSports.length <= 5
    }

}