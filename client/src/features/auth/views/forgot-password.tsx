import { useNavigate } from "@solidjs/router";
import { type Component, createSignal } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useForgotPassword } from "../hooks/use-forgot-password";

export const ForgotPassword: Component = () => {
  const navigate = useNavigate();

  const [email, setEmail] = createSignal("");

  const toast = useToast();
  const forgotPassword = useForgotPassword();

  const handleForgotPassword = async (e: SubmitEvent) => {
    e.preventDefault();

    forgotPassword.mutate(email(), {
      onSuccess: () => {
        toast.success({
          title: "Email sent",
          description:
            "If an account is associated with this email, a reset password email was sent",
        });

        navigate("/");
      },
    });
  };

  return (
    <main class="flex h-screen max-h-screen min-h-screen overflow-clip">
      <div class="m-auto flex flex-col items-center gap-6">
        <h1 class="font-semibold text-3xl">Forgot Your Password?</h1>
        <form onSubmit={handleForgotPassword} class="flex flex-col gap-4">
          <Input
            label="Email address"
            value={email()}
            onChange={setEmail}
            placeholder="user@email.com"
          />

          <Button type="submit" class="w-full">
            Send email
          </Button>
        </form>
      </div>
    </main>
  );
};
