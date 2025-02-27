// Session management for tracking conversation context
let sessionId = localStorage.getItem('hvacAssistantSessionId');
let sessionContext = {};

// Initialize or retrieve session
function initializeSession() {
  if (!sessionId) {
    // Create new session
    sessionId = generateSessionId();
    localStorage.setItem('hvacAssistantSessionId', sessionId);
    
    // Initialize session context
    sessionContext = {
      startTime: new Date().toISOString(),
      equipmentType: null,
      identifiedIssues: [],
      conversationHistory: [],
      lastInteraction: new Date().toISOString()
    };
    
    // Save initial context
    saveSessionContext();
  } else {
    // Retrieve existing session
    try {
      const savedContext = localStorage.getItem(`hvacSession_${sessionId}`);
      if (savedContext) {
        sessionContext = JSON.parse(savedContext);
        sessionContext.lastInteraction = new Date().toISOString();
        console.log("Resumed session:", sessionId);
      } else {
        // Session ID exists but no context - create new context
        resetSession();
      }
    } catch (error) {
      console.error("Error retrieving session:", error);
      resetSession();
    }
  }
}

// Generate unique session ID
function generateSessionId() {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => {
    return Math.floor(Math.random() * 16).toString(16);
  });
}

// Save context to storage
function saveSessionContext() {
  localStorage.setItem(`hvacSession_${sessionId}`, JSON.stringify(sessionContext));
}

// Add information to the session context
function updateSessionContext(key, value) {
  sessionContext[key] = value;
  sessionContext.lastInteraction = new Date().toISOString();
  saveSessionContext();
}

// Save message to session history
function saveToSessionHistory(sender, text) {
  if (!sessionContext.conversationHistory) {
    sessionContext.conversationHistory = [];
  }
  
  sessionContext.conversationHistory.push({
    timestamp: new Date().toISOString(),
    sender,
    text
  });
  
  // Update last interaction time
  sessionContext.lastInteraction = new Date().toISOString();
  
  // Extract and save equipment information if present
  extractEquipmentInfo(text);
  
  // Save updated context
  saveSessionContext();
}

// Extract equipment information from text
function extractEquipmentInfo(text) {
  // Simple keyword extraction - would be more sophisticated in production
  const lowerText = text.toLowerCase();
  
  // Extract equipment type
  const equipmentTypes = ['heat pump', 'ac unit', 'furnace', 'boiler', 'chiller'];
  for (const type of equipmentTypes) {
    if (lowerText.includes(type) && !sessionContext.equipmentType) {
      updateSessionContext('equipmentType', type);
      break;
    }
  }
  
  // Extract model numbers (simplified pattern matching)
  const modelRegex = /model\s+([a-z0-9\-]+)/i;
  const modelMatch = text.match(modelRegex);
  if (modelMatch && modelMatch[1]) {
    updateSessionContext('modelNumber', modelMatch[1]);
  }
  
  // Extract error codes
  const errorRegex = /error\s+code\s+([a-z0-9\-]+)/i;
  const errorMatch = text.match(errorRegex);
  if (errorMatch && errorMatch[1]) {
    const issues = sessionContext.identifiedIssues || [];
    issues.push({
      type: 'errorCode',
      code: errorMatch[1],
      timestamp: new Date().toISOString()
    });
    updateSessionContext('identifiedIssues', issues);
  }
}

// Reset session
function resetSession() {
  sessionId = generateSessionId();
  localStorage.setItem('hvacAssistantSessionId', sessionId);
  
  sessionContext = {
    startTime: new Date().toISOString(),
    equipmentType: null,
    identifiedIssues: [],
    conversationHistory: [],
    lastInteraction: new Date().toISOString()
  };
  
  saveSessionContext();
  console.log("Created new session:", sessionId);
  
  // Clear conversation display
  document.getElementById('conversation-history').innerHTML = '';
}

// Get current session ID for API calls
function getCurrentSessionId() {
  return sessionId;
}

// Initialize session on page load
document.addEventListener('DOMContentLoaded', initializeSession);
