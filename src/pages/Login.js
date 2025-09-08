import React, { useState, useEffect } from "react";
import {
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Redirect URLs
  const localRedirect = "http://localhost:3000/login";
  const prodRedirect = "https://club-portal-blush.vercel.app/login";

  // ✅ Ensure profile exists in DB
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
              role: "user",
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

  // ✅ Handle session + redirect after magic link
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) console.error("Session error:", error.message);

        if (session?.user) {
          const profile = await ensureProfile(session.user);
          redirectUser(profile);
        }
      } finally {
        setLoading(false); // stop loading once checked
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await ensureProfile(session.user);
          redirectUser(profile);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // ✅ Handle magic link login
  const handleLogin = async (redirectUrl) => {
    setMessage("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
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
        {!user ? (
          <>
            <h2 className="login-title">Login with Magic Link</h2>
            <form
              className="login-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(prodRedirect);
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

            {/* Debug buttons */}
            <div className="debug-buttons">
              <button
                className="login-btn"
                onClick={() => handleLogin(localRedirect)}
              >
                Test Local Redirect
              </button>
              <button
                className="login-btn"
                onClick={() => handleLogin(prodRedirect)}
              >
                Test Prod Redirect
              </button>
            </div>

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
