const sendSMS = async (phoneNumber, message) => {
  if (!phoneNumber) {
    return {
      success: false,
      skipped: true,
      message: "No phone number provided",
    };
  }

  console.log("SMS would be sent to:", phoneNumber);
  console.log("Message:", message);

  return {
    success: true,
    message: "SMS service placeholder executed",
    provider: "simulated",
  };
};

module.exports = {
  sendSMS,
};