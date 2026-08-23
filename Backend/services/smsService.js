const sendSMS = async (phoneNumber, message) => {
  if (!phoneNumber) {
    return {
      success: false,
      skipped: true,
      message: "No phone number provided",
    };
  }

  console.log("SMS delivery requested", { messageLength: message?.length || 0 });

  return {
    success: false,
    skipped: true,
    simulated: true,
    message: "SMS provider is not configured",
    provider: "simulated",
  };
};

module.exports = {
  sendSMS,
};