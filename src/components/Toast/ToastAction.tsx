import Button, { ButtonProps } from "../Button/Button";

export type ToastActionProps = ButtonProps;

export default function ToastAction(props: ToastActionProps) {
  return <Button size="small" variant="primary" {...props} />;
}
