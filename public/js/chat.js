const socket = io();

const $messageForm = document.querySelector("#message-form");
const $locationButton = document.querySelector("#send-location");
const $messageFormInput = document.querySelector("input");
const $formSubmitButton = $messageForm.querySelector("button");
const $printMessage = document.querySelector("#messages");
const $sidebar = document.querySelector(".chat__sidebar");

//template
const messageTemplate = document.querySelector("#message-template").innerHTML;

const locationTemplate = document.querySelector("#location-template").innerHTML;

const userSidebarTemplate = document.querySelector("#user-sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
  //new message element
  const $newMessage = $printMessage.lastElementChild;

  //heigth of new msg
  const newMessageHStyle = getComputedStyle($newMessage);
  const newMessageBottom = parseInt(newMessageHStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageBottom;

  const visibleHeight = $printMessage.offsetHeight;

  const containerHeight = $printMessage.scrollHeight;

  const scrollOffset = $printMessage.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $printMessage.scrollTop = $printMessage.scrollHeight;
  }
};

socket.on("roomData", ({ room, usersIn }) => {
  const html = Mustache.render(userSidebarTemplate, {
    room,
    usersIn,
  });

  $sidebar.innerHTML = html;
});

socket.on("message", ({ text, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    message: text,
    time: moment(createdAt).format("LT"),
    username,
  });
  $printMessage.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("url", ({ url, createdAt, username }) => {
  const html = Mustache.render(locationTemplate, {
    url,
    createdAt: moment(createdAt).format("h:mm a"),
    username,
  });
  $printMessage.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $formSubmitButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    //enable
    $formSubmitButton.removeAttribute("disabled");
    //clr input
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) return console.log(error);
    console.log("Meg delevired!");
  });
});

$locationButton.addEventListener("click", () => {
  //disable
  $locationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Your browser not support geolcation");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude }, (msg) => {
      //enable
      $locationButton.removeAttribute("disabled");
      console.log(msg);
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
