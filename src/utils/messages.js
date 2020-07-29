const genrateMessage = (text, username) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const genrateLocationMsg = ({ latitude, longitude }, username) => {
  return {
    username,
    url: `https://google.com/maps?q=${latitude},${longitude}`,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  genrateMessage,
  genrateLocationMsg,
};
