// src/components/ui/Button.jsx
import React from 'react';

const Button = ({ children, variant = "primary", disabled, ...props }) => {
  const base = "btn";
  const colors = {
    primary: "btn-send",
    secondary: "btn-back"
  };
  
  return (
    <button
      className={`${base} ${colors[variant] || colors.primary}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;