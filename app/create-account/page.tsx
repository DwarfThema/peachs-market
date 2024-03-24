import FormButton from "@/components/form-button";
import FormInput from "@/components/form-input";
import SocialLogin from "@/components/social-login";

export default function CreateAccount() {
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1>안녕하세요!</h1>
        <h2>Fill in the form below to join!</h2>
      </div>
      <form className="flex flex-col gap-3">
        <FormInput
          name="username"
          type="text"
          placeholder="userName"
          required
          error={[]}
        />
        <FormInput
          name="email"
          type="email"
          placeholder="Email"
          required
          error={[]}
        />{" "}
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          required
          error={[]}
        />{" "}
        <FormInput
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          required
          error={[]}
        />
        <FormButton text="Create Account" />
      </form>
      <SocialLogin />
    </div>
  );
}
