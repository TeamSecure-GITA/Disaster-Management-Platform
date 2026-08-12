const sendSMS = async (phoneNumber, message) => {
  console.log("SMS would be sent to:", phoneNumber);
  console.log("Message:", message);

  return {
    success: true,
    message: "SMS service placeholder executed",
  };
};

module.exports = {
  sendSMS,
};