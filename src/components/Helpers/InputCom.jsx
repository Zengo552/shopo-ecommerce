export default function InputCom({
  label,
  type,
  name,
  placeholder,
  children,
  onChange,
  value,
  inputClasses,
  labelClasses = "text-qgray text-[13px] font-normal",
  readOnly = false,
  required = false
}) {
  return (
    <div className="input-com w-full h-full">
      {label && (
        <label
          className={`input-label capitalize block mb-2 ${labelClasses || ""}`}
          htmlFor={name}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="input-wrapper border border-qgray-border w-full h-full overflow-hidden relative rounded-lg">
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input-field placeholder:text-sm text-sm px-4 text-dark-gray w-full h-full font-normal bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            inputClasses || ""
          }`}
          type={type}
          id={name}
          name={name}
          readOnly={readOnly}
          required={required}
        />
        {children && children}
      </div>
    </div>
  );
}