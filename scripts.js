import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyDZJoiUD91FU7NCTLI4pm8AiSHuiOu1QQw",
  authDomain: "jam-and-pickles.firebaseapp.com",
  projectId: "jam-and-pickles",
  storageBucket: "jam-and-pickles.firebasestorage.app",
  messagingSenderId: "750747740220",
  appId: "1:750747740220:web:ad28b5ae3bc878b99c7b39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

/* ================= AUTH ================= */

window.signUp = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await createUserWithEmailAndPassword(auth, email, password);
};

window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await signInWithEmailAndPassword(auth, email, password);
};

window.logout = async function() {
  await signOut(auth);
};

onAuthStateChanged(auth, user => {

  if (user) {
    currentUser = user;
    document.getElementById("authBox").classList.add("hidden");
    document.getElementById("userBox").classList.remove("hidden");
    document.getElementById("appSection").classList.remove("hidden");
    document.getElementById("userEmail").innerText = user.email;
    loadPlans();
  } else {
    document.getElementById("authBox").classList.remove("hidden");
    document.getElementById("userBox").classList.add("hidden");
    document.getElementById("appSection").classList.add("hidden");
  }

});

/* ================= AI ================= */

const OPENAI_KEY = "YOUR_OPENAI_KEY";

window.generatePlan = async function() {

  const ingredients = document.getElementById("ingredients").value;
  document.getElementById("loading").classList.remove("hidden");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + OPENAI_KEY
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Create 7-day meal plan using: " + ingredients }
      ]
    })
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.choices[0].message.content;
  document.getElementById("loading").classList.add("hidden");
};

/* ================= SAVE ================= */

window.savePlan = async function() {

  const content = document.getElementById("result").innerText;
  if (!content) return;

  await addDoc(collection(db, "plans"), {
    userId: currentUser.uid,
    content: content,
    createdAt: new Date()
  });

  loadPlans();
};

async function loadPlans() {

  const q = query(
    collection(db, "plans"),
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  const container = document.getElementById("savedPlans");
  container.innerHTML = "";

  snapshot.forEach(doc => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = doc.data().content;
    container.appendChild(div);
  });
}
