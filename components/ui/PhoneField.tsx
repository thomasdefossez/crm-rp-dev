import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { Label } from "@/components/ui/label"

interface PhoneFieldProps {
    label?: string
    value: string
    onChange: (value: string) => void
    required?: boolean
}

export const PhoneField = ({
                               label = "Téléphone",
                               value,
                               onChange,
                               required = false,
                           }: PhoneFieldProps) => (
    <div className="col-span-2">
        <Label className="mb-1 block">{label}</Label>
        <PhoneInput
            value={value}
            onChange={onChange}
            defaultCountry="FR"
            international
            countryCallingCodeEditable={false}
            className="max-w-sm w-full border border-input rounded-md px-3 py-2 text-sm shadow-sm"
            required={required}
        />
    </div>
)