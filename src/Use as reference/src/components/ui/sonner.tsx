import { Toaster as Sonner } from "sonner@2.0.3";

const Toaster = (props: any) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      {...props}
    />
  );
};

export { Toaster };
