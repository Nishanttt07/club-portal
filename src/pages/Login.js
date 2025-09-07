import React, { useState, useEffect } from "react";
import {
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // your custom styles

export default function Login() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Redirect URL for magic link
  const redirectUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/login"
      : "https://club-portal-blush.vercel.app/login";

  // ✅ Ensure profile exists in DB
  const ensureProfile = async (user) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No profile found → creating one...");
        } else {
          console.error("Error fetching profile:", error.message);
          return null;
        }
      }

      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              email: user.email,
              role: "user", // default role
            },
          ])
          .select("role")
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError.message);
          return null;
        }
        return newProfile;
      }

      return profile;
    } catch (err) {
      console.error("Unexpected error in ensureProfile:", err);
      return null;
    }
  };

  // ✅ Redirect user based on role
  const redirectUser = (profile) => {
    if (!profile) {
      console.warn("No profile found, staying on login page");
      return;
    }
    if (profile.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  // ✅ When user logs in, check profile + redirect
  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const profile = await ensureProfile(user);
        redirectUser(profile);
      }
    };
    checkProfile();
  }, [user]);

  // ✅ Handle magic link login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Check your email for the login link!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay"></div>

      <header className="login-header">
        <h1 className="app-title">🎓 ClubHub</h1>
        <p className="app-tagline">Connecting Students. Empowering Clubs.</p>
      </header>

      <main className="login-container">
        {!user ? (
          <>
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
          </>
        ) : (
          <p className="loading-text">Redirecting...</p>
        )}
      </main>

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
