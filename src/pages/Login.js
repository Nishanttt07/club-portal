// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // ✅ make sure this file is set up
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Ensure profile exists
  const ensureProfile = async (user) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error.message);
        return null;
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

  // Redirect based on role
  const redirectUser = (profile) => {
    if (!profile) {
      setMessage("⚠️ No profile found. Contact admin.");
      return;
    }
    if (profile.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  // Check if user already has a session (from magic link)
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await ensureProfile(session.user);
        redirectUser(profile);
      } else {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await ensureProfile(session.user);
        redirectUser(profile);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle magic link login
  const handleLogin = async () => {
    setMessage(`Sending magic link to ${email}...`);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://club-portal-blush.vercel.app", // ✅ must match Supabase redirect settings
      },
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Check your email for the login link!");
    }
  };

  if (loading) {
    return <p className="loading-text">Loading...</p>;
  }

  return (
    <div className="login-page">
      <div className="login-overlay"></div>

      <header className="login-header">
        <h1 className="app-title">🎓 ClubHub</h1>
        <p className="app-tagline">Connecting Students. Empowering Clubs.</p>
      </header>

      <main className="login-container">
        <h2 className="login-title">Login with Magic Link</h2>
        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
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

      <footer className="login-footer">
        <p>© {new Date().getFullYear()} ClubHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
