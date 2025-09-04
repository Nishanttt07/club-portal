// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";

// export default function Navbar() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Fetch current user on mount
//     const getUser = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       setUser(user);
//     };
//     getUser();

//     // Listen to auth state changes (login / logout)
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     // Cleanup subscription when component unmounts
//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/login"); // redirect after logout
//   };

//   return (
//     <nav
//       style={{
//         padding: "10px 20px",
//         background: "#f5f5f5",
//         display: "flex",
//         justifyContent: "flex-end",
//         alignItems: "center",
//       }}
//     >
//       {user && (
//         <button
//           onClick={handleLogout}
//           style={{
//             background: "red",
//             color: "white",
//             border: "none",
//             padding: "8px 16px",
//             borderRadius: "6px",
//             cursor: "pointer",
//           }}
//         >
//           Logout
//         </button>
//       )}
//     </nav>
//   );
// }
