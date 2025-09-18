// icons/ThinLove.jsx
export default function ThinLove({ 
  filled = false, 
  className = "", 
  size = 16,
  color = "currentColor",
  strokeWidth = 1.5,
  onClick,
  disabled = false,
  title = ""
}) {
  const fillColor = filled ? color : "none";
  const strokeColor = filled ? "none" : color;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className={`${className} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} transition-colors duration-200`}
      aria-label={filled ? "Remove from favorites" : "Add to favorites"}
      onClick={!disabled ? onClick : undefined}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      title={title}
    >
      <path 
        d="M11.6 1C10.1 1 8.8 1.8 8 3C7.2 1.8 5.9 1 4.4 1C2 1 0 3 0 5.4C0 9.6 8 15 8 15C8 15 16 9.6 16 5.4C16 3 14 1 11.6 1Z" 
        className={filled ? "" : "hover:stroke-red-600"}
      />
    </svg>
  );
}