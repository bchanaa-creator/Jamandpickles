/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyDZJoiUD91FU7NCTLI4pm8AiSHuiOu1QQw",
  authDomain: "jam-and-pickles.firebaseapp.com",
  projectId: "jam-and-pickles",
  storageBucket: "jam-and-pickles.firebasestorage.app",
  messagingSenderId: "750747740220",
  appId: "1:750747740220:web:ad28b5ae3bc878b99c7b39"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

/* ================= UI ================= */

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const modal = document.getElementById("loginModal");
const saveBtn = document.getElementById("saveBtn");
const savedSection = document.getElementById("savedSection");

/* ================= AUTH ================= */

loginBtn.onclick = () => modal.classList.remove("hidden");
function closeModal() { modal.classList.add("hidden"); }

function signUp() {
  auth.createUserWithEmailAndPassword(
    email.value, password.value
  ).catch(e => alert(e.message));
}

function login() {
  auth.signInWithEmailAndPassword(
    email.value, password.value
  ).catch(e => alert(e.message));
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {

  if (user) {

    currentUser = user;

    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");

    saveBtn.classList.remove("hidden");
    savedSection.classList.remove("hidden");

    modal.classList.add("hidden");

    loadPlans();

  } else {

    currentUser = null;

    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");

    saveBtn.classList.add("hidden");
    savedSection.classList.add("hidden");

  }

});

/* ================= AI ================= */

const OPENAI_KEY = "YOUR_OPENAI_KEY";

async function generatePlan() {

  const ingredients = document.getElementById("ingredients").value;

  if (!ingredients) {
    alert("Enter ingredients first");
    return;
  }

  loading.classList.remove("hidden");

  const res = await fetch(
    "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: "Create 7 day meal plan with: " + ingredients }
        ]
      })
    }
  );

  const data = await res.json();

  result.innerText = data.choices[0].message.content;

  loading.classList.add("hidden");
}

/* ================= SAVE ================= */

async function savePlan() {

  if (!currentUser) return;

  const content = result.innerText;

  if (!content) return;

  await db.collection("plans").add({
    userId: currentUser.uid,
    content,
    created: new Date()
  });

  loadPlans();
}

async function loadPlans() {

  const snap = await db.collection("plans")
    .where("userId","==",currentUser.uid)
    .orderBy("created","desc")
    .get();

  savedPlans.innerHTML = "";

  snap.forEach(doc => {

    const div = document.createElement("div");
    div.className = "card";
    div.innerText = doc.data().content;

    savedPlans.appendChild(div);

  });
}
