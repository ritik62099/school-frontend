// src/components/ui/Input.jsx
import React from 'react';

const Input = ({ label, type = "text", required, ...props }) => (
  <div className="input-group">
    {label && <label>{label}</label>}
    <input
      type={type}
      required={required}
      className="form-input"
      {...props}
    />
  </div>
);

export default Input;