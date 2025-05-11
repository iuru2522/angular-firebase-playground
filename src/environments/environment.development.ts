export const environment = {
    production: false,
    // supposing you have a backend where to send some requests
    backendUrl: "http://127.0.0.1:8000",
    // The firebase config you retrieved from the console.
    // Note that this is NOT sensitive information
    firebaseConfig: {
      apiKey: "<firebase-api-key>",
      authDomain: "<my-project-id>.firebaseapp.com",
      projectId: "<my-project-id>",
      storageBucket: "<my-project-id>.appspot.com",
      messagingSenderId: "<my-messaging-sender-id",
      appId: "<my-app-id>",
    },
  };