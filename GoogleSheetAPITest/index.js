let sendButton = document.querySelector('button');

function send() {
  let name = document.querySelector('#nameValue').value;
  let phone = document.querySelector('#phoneValue').value;
  let demand = document.querySelector('#demandValue').value;
  $.ajax({
    url: "https://script.google.com/a/macros/jsjh.tp.edu.tw/s/AKfycbxYb1rhz8c6yxE7BhAyJOkrG8XE1A5GT8zIbU9QVcF0Lo_U1Qt5hYOf1dS6rVCHI84f5Q/exec",
    data: {
        "name": name,
        "phone": phone,
        "demand": demand
    },
    success: function(response) {
      if(response == "成功"){
        alert("成功");
      }
    },
  });
};

sendButton.addEventListener('click', send);
