import { useState, useEffect } from "react";

export default function InputQuantityCom({ quantity = 1, onQuantityChange }) {
  const [localQuantity, setLocalQuantity] = useState(quantity);

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  const increment = () => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    }
  };

  const decrement = () => {
    if (localQuantity > 1) {
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      if (onQuantityChange) {
        onQuantityChange(newQuantity);
      }
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setLocalQuantity(value);
      if (onQuantityChange) {
        onQuantityChange(value);
      }
    }
  };

  return (
    <div className="w-[120px] h-[40px] px-[26px] flex items-center border border-qgray-border">
      <div className="flex justify-between items-center w-full">
        <button
          onClick={decrement}
          type="button"
          className="text-base text-qgray hover:text-qblack transition-colors duration-200"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={localQuantity}
          onChange={handleInputChange}
          className="text-qblack w-10 text-center border-none focus:outline-none focus:ring-0"
        />
        <button
          onClick={increment}
          type="button"
          className="text-base text-qgray hover:text-qblack transition-colors duration-200"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}