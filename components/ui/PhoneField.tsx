import PhoneInput from "react-phone-number-input"
import { Label } from "@/components/ui/label"
import clsx from "clsx"

interface PhoneFieldProps {
    label?: string
    value: string
    onChange: (value: string) => void
    required?: boolean
    className?: string
}

export const PhoneField = ({
                               label = "Téléphone",
                               value,
                               onChange,
                               required = false,
                               className,
                           }: PhoneFieldProps) => (
    <div className="col-span-2">
        <Label className="mb-1 block">{label}</Label>
        <PhoneInput
            value={value}
            onChange={onChange}
            defaultCountry="FR"
            international
            countryCallingCodeEditable={false}
            className={clsx("max-w-sm w-full border border-input rounded-md px-3 py-2 text-sm shadow-sm", className)}
            required={required}
        />
    </div>
)