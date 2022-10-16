const button = document.getElementById("form-button");

button.addEventListener("click", (e) => {
  e.preventDefault();

  const query = document.getElementById("formText").value;

  console.log(`Generating QR code for ${query}`);
});
