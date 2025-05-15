import {z} from "zod"
import { requiredString } from "./shared"

export const SignInSchema = z.object({
    email: requiredString.regex( /^[a-zA-Z0-9._%+-]+@(hotmail\.com|gmail\.tn)$/,
        "Email must be a valid @gmail.com or @hotmail.com address"),
    password: requiredString.min(8, 'Password must be at least 8 Characters long')
})