/* ============================================================================
   EDUBIME EDUCATIONAL PORTAL — auth-db.js
   Firebase Database Layer & Firestore Authentication (Configured)
   ============================================================================ */

// Firebase Configuration with your exact project details
const firebaseConfig = {
  apiKey: "AIzaSyB_tnjDXBCIV9ZTP-rwaANiKBqMj6jyYmQ",
  authDomain: "edu-web-2311d.firebaseapp.com",
  projectId: "edu-web-2311d",
  storageBucket: "edu-web-2311d.firebasestorage.app",
  messagingSenderId: "799500095119",
  appId: "1:799500095119:web:9c2b8e0fc0a0168997eafa",
  measurementId: "G-FHHCWTEW67"
};

// Initialize Firebase (Compat Mode for CDN scripts in index.html)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Namespace for EduApp Data Methods
window.EduDB = {

  // ---- PUBLIC / HOME DATA ----
  async getNotices() {
    try {
      const snapshot = await db.collection("public_notices").orderBy("createdAt", "desc").limit(5).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching notices:", err);
      return [];
    }
  },

  async getStudentShowcase() {
    try {
      const snapshot = await db.collection("public_showcase").get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching showcase:", err);
      return [];
    }
  },

  // ---- PARENT PORTAL ----
  async searchStudent(studentCode) {
    try {
      const doc = await db.collection("students").doc(studentCode.trim().toUpperCase()).get();
      if (doc.exists) {
        return { success: true, data: doc.data() };
      }
      return { success: false, message: "Student not found with this code." };
    } catch (err) {
      console.error("Error searching student:", err);
      return { success: false, message: "Search failed. Check network connection." };
    }
  },

  async submitParentVote(voteOption) {
    try {
      await db.collection("parent_votes").add({
        vote: voteOption,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      console.error("Error submitting vote:", err);
      return { success: false };
    }
  },

  // ---- ADMISSION FORM ----
  async submitAdmission(formData) {
    try {
      await db.collection("admissions").add({
        ...formData,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: "pending"
      });
      return { success: true };
    } catch (err) {
      console.error("Error submitting admission:", err);
      return { success: false, message: "Submission failed." };
    }
  },

  // ---- TEACHER PORTAL ----
  async teacherLogin(code, password) {
    try {
      const snapshot = await db.collection("teachers")
        .where("code", "==", code.trim())
        .where("password", "==", password.trim())
        .get();

      if (!snapshot.empty) {
        const teacherData = snapshot.docs[0].data();
        return { success: true, teacher: { id: snapshot.docs[0].id, ...teacherData } };
      }
      return { success: false, message: "Invalid Teacher Code or Password." };
    } catch (err) {
      console.error("Teacher login error:", err);
      return { success: false, message: "Login failed." };
    }
  },

  async getAssignedStudents(className) {
    try {
      const snapshot = await db.collection("students").where("class", "==", className).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching students:", err);
      return [];
    }
  },

  async updateStudentAdvice(studentId, attendanceStatus, adviceText) {
    try {
      await db.collection("students").doc(studentId).update({
        attendanceStatus: attendanceStatus,
        teacherAdvice: adviceText,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      console.error("Error updating student:", err);
      return { success: false };
    }
  },

  // ---- OWNER PORTAL ----
  async ownerLogin(passcode) {
    try {
      const doc = await db.collection("settings").doc("owner_config").get();
      if (doc.exists && doc.data().passcode === passcode.trim()) {
        return { success: true };
      }
      return { success: false, message: "Incorrect Passcode." };
    } catch (err) {
      console.error("Owner login error:", err);
      return { success: false, message: "Authentication failed." };
    }
  },

  async publishNotice(textEn, textBn) {
    try {
      await db.collection("public_notices").add({
        textEn: textEn,
        textBn: textBn || textEn,
        date: new Date().toLocaleDateString("en-GB"),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      console.error("Error publishing notice:", err);
      return { success: false };
    }
  },

  async assignTeacherClass(teacherId, className) {
    try {
      await db.collection("teachers").doc(teacherId).update({
        assignedClasses: firebase.firestore.FieldValue.arrayUnion(className)
      });
      return { success: true };
    } catch (err) {
      console.error("Error assigning class:", err);
      return { success: false };
    }
  },

  async getAdmissionsInbox() {
    try {
      const snapshot = await db.collection("admissions").orderBy("submittedAt", "desc").get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching admissions inbox:", err);
      return [];
    }
  },

  async getVoteStats() {
    try {
      const snapshot = await db.collection("parent_votes").get();
      const totals = {};
      snapshot.docs.forEach(doc => {
        const vote = doc.data().vote;
        totals[vote] = (totals[vote] || 0) + 1;
      });
      return totals;
    } catch (err) {
      console.error("Error fetching vote stats:", err);
      return {};
    }
  }
};
