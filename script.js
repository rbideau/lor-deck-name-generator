const inputField = document.getElementById("input__field");
const previewCopyBtn = document.getElementById("preview__copy");
const previewContent = document.getElementById("preview__content");

// Update preview
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

// Picker: bold
document.getElementById("picker__bold").addEventListener("click", () => {
  const cursorPosition = getCursorPosition(inputField);
  inputField.value = cursorPosition.hasOwnProperty("start")
    ? wrapeTextSelectionWithTag("<b>", "</b>", cursorPosition, inputField.value)
    : wrapeTextSelectionWithTag(
        "<b>",
        "</b>",
        { start: cursorPosition.position, end: inputField.value.length },
        inputField.value
      );

  inputField.dispatchEvent(new Event("input"));
  inputField.focus();
});

// Picker: italic
document.getElementById("picker__italic").addEventListener("click", () => {
  const cursorPosition = getCursorPosition(inputField);
  inputField.value = cursorPosition.hasOwnProperty("start")
    ? wrapeTextSelectionWithTag("<i>", "</i>", cursorPosition, inputField.value)
    : wrapeTextSelectionWithTag(
        "<i>",
        "</i>",
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

function textMeshRichTextToHtml(text) {
  // http://digitalnativestudios.com/textmeshpro/docs/rich-text/
  return (
    text
      // bold
      .replaceAll("<b>", '<span style="font-weight: bold">')
      .replaceAll("</b>", "</span>")
      // italic
      .replaceAll("<i>", '<span style="font-style: italic">')
      .replaceAll("</i>", "</span>")
  );
}
