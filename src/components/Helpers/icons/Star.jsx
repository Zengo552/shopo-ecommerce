// icons/Star.jsx
export default function Star({ filled = false }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      className="text-yellow-400"
    >
      <path d="M7 1L9.16 4.84L13.5 5.5L10.5 8.5L11.16 12.84L7 10.84L2.84 12.84L3.5 8.5L0.5 5.5L4.84 4.84L7 1Z" />
    </svg>
  );
}