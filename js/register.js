// js/register.js

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
// Import the Authentication functions
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// Initialize Firebase

// Get the form from the DOM
const registerForm = document.getElementById('registerForm');

// Add a 'submit' event listener to the form
registerForm.addEventListener("submit", function(event) {
  // Prevent the form from submitting the default way
  event.preventDefault();

  // Get the user's input from the form fields
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Use the Firebase function to create a new user
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // The user was created successfully!
      const user = userCredential.user;
      
      // Now, update the user's profile to add their name
      return updateProfile(user, {
        displayName: name
      });
    })
    .then(() => {
      console.log('Registration successful. Redirecting...');
      // **REDIRECT TO THE MAIN APP PAGE**
      window.location.href = 'index.html'; 
    })
    .catch((error) => {
      // An error occurred. Handle it here.
      const errorMessage = error.message;
      console.error("Registration Error:", errorMessage);
      alert(`Error: ${errorMessage}`);
    });
});