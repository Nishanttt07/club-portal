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

  // ✅ Ensure user has a profile row
  const ensureProfile = async (user) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.details?.includes("0 rows")) {
          console.log("No profile found → creating one...");
        } else {
          console.error("Error fetching profile:", error.message);
          return null;
        }
      }

      // If profile doesn’t exist → create default profile
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
      setLoading(false); // stop loading if no profile
      return;
    }
    if (profile.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  // ✅ Check session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("Session check:", data);

        if (error) {
          console.error("Error checking session:", error.message);
          setLoading(false);
          return;
        }

        if (data.session?.user) {
          const profile = await ensureProfile(data.session.user);
          console.log("Loaded profile:", profile);
          redirectUser(profile);
        } else {
          setLoading(false); // no session → show login page
        }
      } catch (err) {
        console.error("Unexpected error in checkUser:", err);
        setLoading(false);
      }
    };

    checkUser();

    // ✅ Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth event:", _event, session);
      if (session?.user) {
        const profile = await ensureProfile(session.user);
        redirectUser(profile);
      } else {
        setLoading(false); // logged out
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // ✅ Handle login via magic link
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
