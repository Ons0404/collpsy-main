// components/ui/Input.tsx
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});

Input.displayName = "Input";

export default Input;
