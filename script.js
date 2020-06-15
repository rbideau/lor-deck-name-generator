const inputField = document.getElementById("input__field");
const previewCopyBtn = document.getElementById("preview__copy");
const previewContent = document.getElementById("preview__content");

// Update preview and add listner
previewContent.innerHTML = textMeshRichTextToHtml(inputField.value) || "...";
inputField.addEventListener("input", () => {
  previewContent.innerHTML = textMeshRichTextToHtml(inputField.value) || "...";
  previewCopyBtn.innerHTML = "Copy";
});

// Copy
previewCopyBtn.innerHTML = "Copy";
previewCopyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(inputField.value).then(
    function () {
      previewCopyBtn.innerHTML = "Copied !";
    },
    function (err) {
      previewCopyBtn.innerHTML = "Error !";
      console.error(err);
    }
  );
});

// Add simple Pickers
addPickerListener("picker__bold", "<b>", "</b>");
addPickerListener("picker__italic", "<i>", "</i>");
addPickerListener("picker__underscore", "<u>", "</u>");
addPickerListener("picker__strikeThrough", "<s>", "</s>");

// Color picker
// Simple example, see optional options for more configuration.
const pickr = Pickr.create({
  el: "#picker_color",
  useAsButton: true,
  lockOpacity: true,
  theme: "classic", // or 'monolith', or 'nano'
  swatches: [
    "rgb(244, 67, 54)",
    "rgb(233, 30, 99)",
    "rgb(156, 39, 176)",
    "rgb(103, 58, 183)",
    "rgb(63, 81, 181)",
    "rgb(33, 150, 243)",
    "rgb(3, 169, 244)",
    "rgb(0, 188, 212)",
    "rgb(0, 150, 136)",
    "rgb(76, 175, 80)",
    "rgb(139, 195, 74)",
    "rgb(205, 220, 57)",
    "rgb(255, 235, 59)",
    "rgb(255, 193, 7)",
  ],
  components: {
    // Main components
    preview: true,
    opacity: false,
    hue: true,
    // Input / output Options
    interaction: {
      hex: true,
      rgba: true,
      hsla: true,
      hsva: true,
      cmyk: true,
      input: true,
      clear: false,
      save: true,
    },
  },
  i18n: {
    "btn:save": "Apply",
    "aria:btn:save": "apply and close",
  },
});
pickr.on("save", function () {
  const color = "#" + pickr.getColor().toHEXA().join("").toUpperCase();
  const cursorPosition = getCursorPosition(inputField);
  const openingTag = `<color=${color}>`;
  const closingTag = "</color>";
  inputField.value = cursorPosition.hasOwnProperty("start")
    ? wrapeTextSelectionWithTag(
        openingTag,
        closingTag,
        cursorPosition,
        inputField.value
      )
    : wrapeTextSelectionWithTag(
        openingTag,
        closingTag,
        { start: cursorPosition.position, end: inputField.value.length },
        inputField.value
      );
  inputField.dispatchEvent(new Event("input"));
  inputField.focus();
});
// utlis

/**
 * Returns:
 * - an object with {start, end} when there is a selected text
 * - an object with {position} otherwise. If the texte has not been focus, the position is at the start
 */
function getCursorPosition(elem) {
  const start = elem.selectionStart;
  const end = elem.selectionEnd;

  // Check if you've selected text
  if (start === end) {
    if (start === elem.value.length) {
      return { position: 0 };
    } else {
      return { position: start };
    }
  } else {
    return { start, end };
  }
}

function wrapeTextSelectionWithTag(openTag, closeTag, selection, text) {
  return (
    text.substring(0, selection.start) +
    openTag +
    text.substring(selection.start, selection.end) +
    closeTag +
    text.substring(selection.end, text.length)
  );
}

function insertTagAtPosition(tag, position, text) {
  return (
    text.substring(0, position) + tag + text.substring(position, text.length)
  );
}

function addPickerListener(selector, openingTag, closingTag = null) {
  document.getElementById(selector).addEventListener("click", () => {
    const cursorPosition = getCursorPosition(inputField);
    if (closingTag) {
      inputField.value = cursorPosition.hasOwnProperty("start")
        ? wrapeTextSelectionWithTag(
            openingTag,
            closingTag,
            cursorPosition,
            inputField.value
          )
        : wrapeTextSelectionWithTag(
            openingTag,
            closingTag,
            { start: cursorPosition.position, end: inputField.value.length },
            inputField.value
          );
    } else {
      inputField.value = insertTagAtPosition(
        openingTag,
        cursorPosition.position,
        inputField.value
      );
    }

    inputField.dispatchEvent(new Event("input"));
    inputField.focus();
  });
}

function textMeshRichTextToHtml(text) {
  // http://digitalnativestudios.com/textmeshpro/docs/rich-text/
  return (
    text
      // bold
      .replace(/<b>/g, '<span style="font-weight: bold">')
      .replace(/<\/b>/g, "</span>")
      // italic
      .replace(/<i>/g, '<span style="font-style: italic">')
      .replace(/<\/i>/g, "</span>")
      // strikethrough
      .replace(/<s>/g, '<span style="text-decoration: line-through">')
      .replace(/<\/s>/g, "</span>")
      // underline
      .replace(/<u>/g, '<span style="text-decoration: underline">')
      .replace(/<\/u>/g, "</span>")
      // color
      .replace(/<color=(#[A-Z0-9]{6})>/g, function (match, color) {
        return `<span style="color: ${color}">`;
      })
      .replace(/<\/color>/g, "</span>")
  );
}
