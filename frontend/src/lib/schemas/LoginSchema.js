import z from "zod";

export const loginValidationSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Minimum 10 charectors is requied.")
    .max(15, "maximum 15 char is allowed.")
    .regex(/^[0-9]+$/, "Phone number must be in numeric charectors")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

export const otpSchema = z.object({
  otp: z.array(z.string().min(1)).length(6),
});

export const profileSchema = z.object({
  username: z
    .string()
    .nonempty("Username is required")
    .regex(/^[A-Za-z]+$/i, "Only letters are allowed")
    .trim(),

  agreed: z.boolean("you must agree to terms").default(true),
});
