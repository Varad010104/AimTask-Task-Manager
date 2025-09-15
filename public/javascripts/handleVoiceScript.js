
  const voiceBtn = document.getElementById("voiceTaskBtn");

  voiceBtn.addEventListener("click", () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("❌ Browser does not support Speech Recognition");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Voice Input:", transcript);

      let response = await fetch("/voice-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          voiceText: transcript,   
        })
      });

      let result = await response.json();

      if (result.error) {
        alert("❌ " + result.error);
      } else {
        alert("✅ Task added successfully: " + result.task.title);
      }
    };
  });

