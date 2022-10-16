const MAX_QUERY_LEN = 50;
document.getElementById("form-input").maxLength = MAX_QUERY_LEN;
document.getElementById(
  "form-input"
).placeholder = `Max length of ${MAX_QUERY_LEN} characters`;

const colorInput = document.getElementById("color-input");
const bgInput = document.getElementById("bgcolor-input");
const sizeInput = document.getElementById("size-input");

setInputDefaults();
const button = document.getElementById("form-button");

button.addEventListener("click", async (e) => {
  e.preventDefault();

  const query = document.getElementById("form-input").value;
  if (!query || query.length > MAX_QUERY_LEN) return;

  const color = formattedColor(colorInput.value);
  const bg = formattedColor(bgInput.value);
  const size = formattedSize(sizeInput.value);

  const encodedQuery = encodeURIComponent(query);
  console.log(
    `Generating QR code for ${query} with color: ${color}, bg: ${bg}, and size: ${size}`
  );

  // Note: for the lab I wanted to ensure I used fetch(). I could've just assigned the url to the src on the image.
  // This was good practice in reading a blob though!
  try {
    const res = await getQRCode(encodedQuery, size, color, bg);
    const reader = res.body.getReader();
    const stream = await new ReadableStream({
      start(controller) {
        return pump();
        function pump() {
          return reader.read().then(({ done, value }) => {
            // When no more data needs to be consumed, close the stream
            if (done) {
              controller.close();
              return;
            }
            // Enqueue the next data chunk into our target stream
            controller.enqueue(value);
            return pump();
          });
        }
      },
    });

    const streamResponse = await new Response(stream);
    const blob = await streamResponse.blob();
    const objectURL = await URL.createObjectURL(blob);

    const qrCode = document.getElementById("qr-code");
    qrCode.src = objectURL;
    qrCode.alt = `QR code for ${query} with color: ${color}, bg: ${bg}, and size: ${size}`;
  } catch (e) {
    console.error(e);
  }
});

function getURL(query, size, color, bgcolor) {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${query}&size=${size}&color=${color}&bgcolor=${bgcolor}`;
}

function getQRCode(query, size = 400, color = "000", bgcolor = "fff") {
  const url = getURL(query, size, color, bgcolor);

  return fetch(url);
}

function formattedColor(color) {
  return color.replace("#", "");
}

function formattedSize(size) {
  return `${size}x${size}`;
}

function setInputDefaults() {
  const bodyStyles = window.getComputedStyle(document.body);

  colorInput.value = rgbToHex(bodyStyles.color);
  bgInput.value = rgbToHex(bodyStyles.backgroundColor);
}

function rgbToHex(rgb) {
  const stripped = rgb.substring(4, rgb.length - 1);
  const split = stripped.split(", ");

  const convertToHex = (s) => {
    let hex = Number.parseInt(s).toString(16);
    if (hex.length === 1) {
      hex += hex;
    }

    return hex;
  };

  return `#${convertToHex(split[0])}${convertToHex(split[1])}${convertToHex(
    split[2]
  )}`;
}
