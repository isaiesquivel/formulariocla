import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BecaFormData } from "@/types/BecaForm";

interface FieldProps {
  label: string;
  field: keyof BecaFormData;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (field: keyof BecaFormData, value: string) => void;
}

export function FormFieldInput({ label, field, required, type = "text", placeholder, value, onChange }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="form-field-label">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="bg-background"
      />
    </div>
  );
}

interface RadioFieldProps {
  label: string;
  field: keyof BecaFormData;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (field: keyof BecaFormData, value: string) => void;
}

export function FormRadioField({ label, field, options, required, value, onChange }: RadioFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="form-field-label">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(field, v)}>
        {options.map((o) => (
          <div key={o} className="flex items-center space-x-2">
            <RadioGroupItem value={o} id={`${field}-${o}`} />
            <Label htmlFor={`${field}-${o}`} className="text-sm font-normal cursor-pointer">{o}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
