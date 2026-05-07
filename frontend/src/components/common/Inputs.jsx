export function TextInput({ label, value, onChange, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

export function TextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea className="input min-h-24 py-3" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
