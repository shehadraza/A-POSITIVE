"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      setSuccess("Account created successfully. Welcome to A-POSITIVE!");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 700);

      return;
    }

    setSuccess(
      "Account created! Please check your email to confirm your account."
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-overlay" />

        <Link href="/" className="auth-back">
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        <div className="auth-visual-content">
          <div className="auth-plus">A+</div>

          <p className="auth-eyebrow">A-POSITIVE</p>

          <h2>
            DEFINE
            <br />
            YOUR
            <br />
            STYLE.
          </h2>

          <p className="auth-visual-text">
            Create your account.
            <br />
            Discover fashion made for your identity.
          </p>
        </div>

        <div className="auth-visual-bottom">
          <span>BLUE DREAM</span>
          <span>SHOPPING ZONE BD</span>
          <span>A-POSITIVE</span>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <Link href="/" className="auth-mobile-logo">
            A-POSITIVE
          </Link>

          <div className="auth-heading">
            <span>JOIN A-POSITIVE</span>

            <h1>Create your account</h1>

            <p>
              Join A-POSITIVE and unlock a personalized fashion shopping
              experience.
            </p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name">FULL NAME</label>

              <div className="auth-input-wrap">
                <UserRound size={18} />

                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">EMAIL ADDRESS</label>

              <div className="auth-input-wrap">
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">PASSWORD</label>

              <div className="auth-input-wrap">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>

              <div className="auth-input-wrap">
                <LockKeyhole size={18} />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-message auth-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div
                className="auth-message auth-success"
                role="status"
                aria-live="polite"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              <span>
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </span>

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>ALREADY A MEMBER?</span>
          </div>

          <Link href="/login" className="auth-register">
            SIGN IN TO YOUR ACCOUNT
            <ArrowRight size={17} />
          </Link>

          <p className="auth-terms">
            By creating an account, you agree to our Terms & Conditions and
            Privacy Policy.
          </p>
        </div>
      </section>

      <style jsx global>{`
        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          background: #ffffff;
          color: #0b0b0b;
        }

        .auth-visual {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 75% 25%,
              rgba(200, 164, 93, 0.2),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #090909 0%,
              #111111 55%,
              #181818 100%
            );
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 38px 45px;
        }

        .auth-visual-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
        }

        .auth-back {
          position: relative;
          z-index: 2;
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }

        .auth-back:hover {
          color: #ffffff;
        }

        .auth-visual-content {
          position: relative;
          z-index: 2;
          max-width: 620px;
          margin: auto 0;
        }

        .auth-plus {
          font-size: clamp(110px, 15vw, 240px);
          line-height: 0.72;
          font-weight: 800;
          letter-spacing: -18px;
          color: rgba(255, 255, 255, 0.035);
          margin-left: -18px;
          margin-bottom: 28px;
        }

        .auth-eyebrow {
          color: #c8a45d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 4px;
          margin: 0 0 18px;
        }

        .auth-visual-content h2 {
          margin: 0;
          font-size: clamp(48px, 6vw, 92px);
          line-height: 0.9;
          font-weight: 800;
          letter-spacing: -4px;
        }

        .auth-visual-text {
          margin: 30px 0 0;
          color: rgba(255, 255, 255, 0.58);
          font-size: 14px;
          line-height: 1.8;
        }

        .auth-visual-bottom {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: rgba(255, 255, 255, 0.35);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }

        .auth-form-side {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px 70px;
          background: #ffffff;
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 450px;
        }

        .auth-mobile-logo {
          display: none;
          color: #0b0b0b;
          text-decoration: none;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 3px;
          margin-bottom: 45px;
        }

        .auth-heading {
          margin-bottom: 32px;
        }

        .auth-heading > span {
          display: block;
          color: #c8a45d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
          margin-bottom: 12px;
        }

        .auth-heading h1 {
          margin: 0;
          font-size: 38px;
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: -1.8px;
        }

        .auth-heading p {
          margin: 15px 0 0;
          max-width: 390px;
          color: #777777;
          font-size: 13px;
          line-height: 1.7;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 19px;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .auth-field label {
          color: #444444;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }

        .auth-input-wrap {
          height: 54px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 15px;
          border: 1px solid #e5e5e5;
          background: #fafafa;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .auth-input-wrap:focus-within {
          border-color: #c8a45d;
          background: #ffffff;
        }

        .auth-input-wrap > svg {
          flex: 0 0 auto;
          color: #999999;
        }

        .auth-input-wrap input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #0b0b0b;
          font-family: inherit;
          font-size: 13px;
        }

        .auth-input-wrap input::placeholder {
          color: #aaaaaa;
        }

        .auth-password-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border: 0;
          background: transparent;
          color: #888888;
          cursor: pointer;
        }

        .auth-message {
          padding: 12px 14px;
          font-size: 11px;
          line-height: 1.5;
        }

        .auth-error {
          border: 1px solid #ead1d1;
          background: #fff7f7;
          color: #a33333;
        }

        .auth-success {
          border: 1px solid #d7e5d7;
          background: #f6fbf6;
          color: #397039;
        }

        .auth-submit {
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #0b0b0b;
          background: #0b0b0b;
          color: #ffffff;
          font-family: inherit;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
          margin-top: 4px;
        }

        .auth-submit:hover:not(:disabled) {
          background: #c8a45d;
          border-color: #c8a45d;
          color: #0b0b0b;
        }

        .auth-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 28px 0 18px;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #ededed;
        }

        .auth-divider span {
          color: #aaaaaa;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.5px;
          white-space: nowrap;
        }

        .auth-register {
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #dedede;
          color: #0b0b0b;
          text-decoration: none;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.8px;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .auth-register:hover {
          border-color: #0b0b0b;
          background: #fafafa;
        }

        .auth-terms {
          margin: 24px 0 0;
          color: #aaaaaa;
          text-align: center;
          font-size: 9px;
          line-height: 1.7;
        }

        @media (max-width: 900px) {
          .auth-page {
            grid-template-columns: 1fr;
          }

          .auth-visual {
            display: none;
          }

          .auth-form-side {
            min-height: 100vh;
            padding: 35px 25px;
          }

          .auth-mobile-logo {
            display: block;
          }

          .auth-form-wrap {
            max-width: 480px;
          }
        }

        @media (max-width: 480px) {
          .auth-form-side {
            padding: 28px 20px;
          }

          .auth-heading h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </main>
  );
}