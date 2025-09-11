export default function InputCom({
  label,
  type,
  name,
  placeholder,
  children,
  onChange, // Changed from inputHandler to onChange
  value,
  inputClasses,
  labelClasses = "text-qgray text-[13px] font-normal",
  readOnly = false // Added readOnly prop
}) {
  return (
    <div className="input-com w-full h-full">
      {label && (
        <label
          className={`input-label capitalize block  mb-2 ${labelClasses || ""}`}
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <div className="input-wrapper border border-qgray-border w-full h-full overflow-hidden relative ">
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange} // Changed from inputHandler to onChange
          className={`input-field placeholder:text-sm text-sm px-6 text-dark-gray w-full h-full font-normal bg-white focus:ring-0 focus:outline-none ${
            inputClasses || ""
          }`}
          type={type}
          id={name}
          readOnly={readOnly} // Added readOnly attribute
        />
        {children && children}
      </div>
    </div>
  );
}