import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // custom styles

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dynamically set redirect URL (local vs production)
  const redirectUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/login"
      : "https://club-portal-blush.vercel.app/login";

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session:", error.message);
        setLoading(false);
        return;
      }

      if (data.session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }
      setLoading(false);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/user-dashboard");
          }
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Check your email for the login link!");
    }
  };

  if (loading) return <p className="loading-text">Checking login status...</p>;

  return (
    <div className="login-page">
      {/* Background overlay */}
      <div className="login-overlay"></div>

      {/* Content */}
      <header className="login-header">
        <h1 className="app-title">🎓 ClubHub</h1>
        <p className="app-tagline">Connecting Students. Empowering Clubs.</p>
      </header>

      <main className="login-container">
        <h2 className="login-title">Login with Magic Link</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            className="login-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">
            Send Magic Link
          </button>
        </form>
        <p className="login-message">{message}</p>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <p>© {new Date().getFullYear()} ClubHub. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Help</a>
        </div>
      </footer>
    </div>
  );
}
