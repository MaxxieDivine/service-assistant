// Basic implementation using Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const synthesis = window.speechSynthesis;

// Configure speech recognition
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;

// DOM elements
const micButton = document.getElementById('mic-button');
const transcriptDiv = document.getElementById('transcript');
const conversationHistory = document.getElementById('conversation-history');

// Event listeners
micButton.addEventListener('click', toggleListening);

let isListening = false;

function toggleListening() {
  if (!isListening) {
    // Start listening
    recognition.start();
    micButton.classList.add('listening');
    micButton.innerHTML = '<i class="fas fa-stop"></i> Stop';
    isListening = true;
  } else {
    // Stop listening
    recognition.stop();
    micButton.classList.remove('listening');
    micButton.innerHTML = '<i class="fas fa-microphone"></i> Speak';
    isListening = false;
  }
}

// Handle speech recognition results
recognition.onresult = (event) => {
  const speechResult = event.results[0][0].transcript;
  transcriptDiv.textContent = speechResult;
  
  // Send to backend for processing
  processQuery(speechResult);
  
  // Reset UI
  isListening = false;
  micButton.classList.remove('listening');
  micButton.innerHTML = '<i class="fas fa-microphone"></i> Speak';
};

// Process query and get response
async function processQuery(query) {
  // Add user message to conversation
  addMessageToHistory('user', query);
  
  try {
    // In a real implementation, this would call your backend
    const response = await fetchAssistantResponse(query);
    
    // Add assistant response to conversation
    addMessageToHistory('assistant', response);
    
    // Speak the response
    speakResponse(response);
  } catch (error) {
    console.error('Error processing query:', error);
    addMessageToHistory('assistant', 'Sorry, I encountered an error processing your request.');
  }
}

// Simulated backend call - replace with actual API
async function fetchAssistantResponse(query) {
  // This is where you'd integrate with your LLM backend
  // For now, return mock responses based on keywords
  
  // In production, this would be a fetch call to your backend
  // return fetch('/api/assistant', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ query, sessionId: getCurrentSessionId() })
  // }).then(res => res.json()).then(data => data.response);
  
  // For demo purposes only - replace with actual backend
  if (query.toLowerCase().includes('error code')) {
    return "That error code typically indicates a refrigerant pressure issue. Can you tell me if you're seeing any frost on the refrigerant lines?";
  } else if (query.toLowerCase().includes('compressor')) {
    return "For compressor troubleshooting, we should first check if it's receiving power. Can you confirm if the contactor is engaged?";
  } else {
    return "I understand you're working on an HVAC system. Could you provide more details about the issue you're experiencing?";
  }
}

// Speak response using speech synthesis
function speakResponse(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  synthesis.speak(utterance);
}

// Add message to conversation history
function addMessageToHistory(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  
  const contentP = document.createElement('p');
  contentP.textContent = text;
  
  messageDiv.appendChild(contentP);
  conversationHistory.appendChild(messageDiv);
  
  // Scroll to bottom of conversation
  conversationHistory.scrollTop = conversationHistory.scrollHeight;
  
  // Save to session
  saveToSessionHistory(sender, text);
}
